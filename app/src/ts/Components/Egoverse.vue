<script setup lang="ts">
import { SceneKey } from '../Enums/SceneKey';
import { KeyboardKey } from '../Enums/KeyboardKey.ts';
import { useAvatarStore } from '../Stores/AvatarStore';
import { onBeforeUnmount, onMounted, ref, Ref, ComponentPublicInstance } from 'vue';
import ExperienceManager from '../Classes/ExperienceManager';
import PrimaryButton from './PrimaryButton.vue';
import Loader from './Loader.vue';
import { EventService } from '../Services/EventService.ts';
import { CustomEventKey } from '../Enums/CustomEventKey.ts';
import KeybindingsModal from './KeybindingsModal.vue';
import EmoteSelector from './EmoteSelector.vue';
import KeyboardIcon from './Icons/KeyboardIcon.vue';

// Avatar store
const { username, selectedAvatarId } = useAvatarStore();

// State variables
const isReady = ref(false);
const isEmoteSelectorVisible: Ref<boolean> = ref(false);
const isKeyBindingsModalVisible: Ref<boolean> = ref(false);
const canvas = ref<HTMLCanvasElement | null>(null);
const areaButtons: Ref<Record<SceneKey, HTMLElement>> = ref({} as Record<SceneKey, HTMLElement>);
const keyBindingsData: Ref<Array<{ instruction: string; labels: Array<string>; isCombination: boolean }>> = ref([
	{ instruction: 'Move forward', labels: ['Z', 'Arrow Up'], isCombination: false },
	{ instruction: 'Move backwards', labels: ['S', 'Arrow Down'], isCombination: false },
	{ instruction: 'Move left', labels: ['Q', 'Arrow Left'], isCombination: false },
	{ instruction: 'Move left', labels: ['D', 'Arrow Right'], isCombination: false },
	{ instruction: 'Sprint', labels: ['SHIFT', 'Any movement key'], isCombination: true },
	{ instruction: 'Jump', labels: ['SPACE'], isCombination: true },
	{ instruction: 'Toggle key bindings modal', labels: ['SHIFT', '?'], isCombination: true },
	{ instruction: 'Toggle emote selection', labels: ['T'], isCombination: true }
]);
const keysPressed: { [key in KeyboardKey]: boolean } = {} as {
	[key in KeyboardKey]: boolean;
};

// Define functions
function transitionToScene(sceneKey: SceneKey): void {
	if (areaButtons.value[sceneKey]) {
		// Blur focus button
		areaButtons.value[sceneKey].blur();
	}

	ExperienceManager.instance.setActiveScene(sceneKey);
}

function setReadyState(): void {
	// Set ready state
	isReady.value = true;
}

function onKeyDown(event: KeyboardEvent) {
	// Save pressed key
	keysPressed[event.code as KeyboardKey] = true;

	if (keysPressed[KeyboardKey.KeyT]) {
		// Set ref
		isEmoteSelectorVisible.value = !isEmoteSelectorVisible.value;
	}

	if (keysPressed[KeyboardKey.ShiftLeft] && keysPressed[KeyboardKey.KeyM]) {
		// Set ref
		isKeyBindingsModalVisible.value = !isKeyBindingsModalVisible.value;
	}
}

function onKeyUp(event: KeyboardEvent) {
	// Save pressed key
	keysPressed[event.code as KeyboardKey] = false;
}

// Lifecycle hooks
onMounted(() => {
	if (canvas.value) {
		ExperienceManager.instance.init(canvas.value, username, selectedAvatarId);

		// Listen for ready event (triggers when backend sends scene data)
		EventService.listen(CustomEventKey.READY, setReadyState);

		document.addEventListener('keydown', (event: KeyboardEvent) => onKeyDown(event));
		document.addEventListener('keyup', (event: KeyboardEvent) => onKeyUp(event));
	}
});

onBeforeUnmount(() => {
	if (ExperienceManager.instance) {
		ExperienceManager.instance.destroy();
	}

	// Remove listeners
	EventService.remove(CustomEventKey.READY, setReadyState);
	document.removeEventListener('keydown', (event: KeyboardEvent) => onKeyDown(event));
	document.removeEventListener('keyup', (event: KeyboardEvent) => onKeyUp(event));
});
</script>

<template>
	<div class="fixed inset-0 bg-white">
		<div class="absolute top-5 left-5 z-10 flex items-center gap-2">
			<Loader v-if="!isReady" />

			<PrimaryButton
				:ref="(el) => (areaButtons[SceneKey.LANDING_AREA] = (el as ComponentPublicInstance).$el as HTMLElement)"
				@click="transitionToScene(SceneKey.LANDING_AREA)"
			>
				Landing Area
			</PrimaryButton>

			<PrimaryButton
				:ref="(el) => (areaButtons[SceneKey.MEETING_ROOM] = (el as ComponentPublicInstance).$el as HTMLElement)"
				@click="transitionToScene(SceneKey.MEETING_ROOM)"
			>
				Meeting Room
			</PrimaryButton>

			<PrimaryButton
				:ref="(el) => (areaButtons[SceneKey.CHAT_ROOM] = (el as ComponentPublicInstance).$el as HTMLElement)"
				@click="transitionToScene(SceneKey.CHAT_ROOM)"
			>
				Chat Room
			</PrimaryButton>
		</div>

		<EmoteSelector :show="isEmoteSelectorVisible" @close="isEmoteSelectorVisible = false" />

		<KeybindingsModal
			:show="isKeyBindingsModalVisible"
			:data="keyBindingsData"
			@close="isKeyBindingsModalVisible = false"
		/>

		<div
			class="absolute right-2 bottom-2 z-10 cursor-pointer rounded-md bg-cyan-400 p-2 shadow-xl"
			@click="isKeyBindingsModalVisible = true"
		>
			<KeyboardIcon class="h-8 w-8 text-white" />
		</div>

		<canvas ref="canvas" class="h-full w-full" />
	</div>
</template>
