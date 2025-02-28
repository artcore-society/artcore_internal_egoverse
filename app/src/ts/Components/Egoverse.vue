<script setup lang="ts">
import { SceneKey } from '../Enums/SceneKey';
import { AvatarType } from '../Enums/AvatarType.ts';
import { KeyboardKey } from '../Enums/KeyboardKey.ts';
import { SocketEvent } from '../Enums/SocketEvent.ts';
import { EventService } from '../Services/EventService.ts';
import { ChatRoomScene } from '../Classes/ChatRoomScene';
import { useAvatarStore } from '../Stores/AvatarStore.ts';
import { CustomEventKey } from '../Enums/CustomEventKey.ts';
import { LandingAreaScene } from '../Classes/LandingAreaScene';
import { MeetingRoomScene } from '../Classes/MeetingRoomScene';
import { ExperienceSocket } from '../Classes/ExperienceSocket.ts';
import { ISocketMessageData } from '../Interfaces/ISocketMessageData.ts';
import { ComponentPublicInstance, onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';
import ExperienceManager from '../Classes/ExperienceManager.ts';
import PrimaryButton from './PrimaryButton.vue';
import Loader from './Loader.vue';
import EmoteSelector from './EmoteSelector.vue';
import KeyboardIcon from './Icons/KeyboardIcon.vue';
import KeybindingsModal from './KeybindingsModal.vue';
import ChatList from './ChatList.vue';
import ChatModal from './ChatModal.vue';

// Avatar store
const { username, selectedAvatarId } = useAvatarStore();

// Set variables
const chats: Ref<Record<string, Array<{ message: string; avatarType: string }>>> = ref({});
const selectedChatUserId: Ref<string | null> = ref(null);
const isChatModalVisible: Ref<boolean> = ref(false);
const isReady: Ref<boolean> = ref(false);
const isEmoteSelectorVisible: Ref<boolean> = ref(false);
const isKeyBindingsModalVisible: Ref<boolean> = ref(false);
const canvas: Ref<HTMLCanvasElement | null> = ref(null);
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

function submitMessage(message: string) {
	if (!ExperienceManager.instance.activeScene) {
		return;
	}

	let visitorId: string | null;

	if (ExperienceManager.instance.selectedAvatar.value) {
		// Get visitor id to send message to via websockets by retrieving it from visitors list/object (keys are the visitor id's)
		visitorId =
			Object.keys(ExperienceManager.instance.activeScene.visitorAvatars).find((key) => {
				return (
					ExperienceManager.instance.activeScene?.visitorAvatars[key]?.model?.uuid ===
					ExperienceManager.instance.selectedAvatar.value?.model?.uuid
				);
			}) ?? null;
	} else {
		// User has not selected an avatar and opened the chat via the UI => use the ref
		visitorId = selectedChatUserId.value;
	}

	if (visitorId) {
		// Populate first
		if (!Array.isArray(chats.value[visitorId])) {
			chats.value[visitorId] = [];
		}

		// Add your message to the chat if it exists with the target visitor
		chats.value[visitorId]?.push({
			message: message,
			avatarType: AvatarType.CURRENT_PLAYER
		});

		// Send message to visitor via websocket event
		ExperienceSocket.emit(SocketEvent.SEND_MESSAGE, {
			receiverUserId: visitorId,
			senderUserId: ExperienceManager.instance.userId,
			message: message
		});
	}

	// Reset hovered avatar
	ExperienceManager.instance.selectedAvatar.value = null;
}

function openChatModal(visitorId: string) {
	// Set refs
	selectedChatUserId.value = visitorId;
	isChatModalVisible.value = true;
}

function closeChatModal() {
	isChatModalVisible.value = false;
	selectedChatUserId.value = null;
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

// Watch
watch(ExperienceManager.instance.selectedAvatar, (value) => {
	if (value && ExperienceManager.instance.activeScene) {
		// Get visitor id to send message to via websockets by retrieving it from visitors list/object (keys are the visitor id's)
		const visitorId = Object.keys(ExperienceManager.instance.activeScene.visitorAvatars).find((key) => {
			return ExperienceManager.instance.activeScene?.visitorAvatars[key]?.model?.uuid === value?.model?.uuid;
		});

		if (visitorId) {
			// Open chat modal
			openChatModal(visitorId);
		}
	}
});

watch(ExperienceManager.instance.incomingVisitorMessageData, (data: ISocketMessageData) => {
	if (data && data.senderUserId && data.message) {
		if (!chats.value[data.senderUserId]) {
			// Create array if not set yet
			chats.value[data.senderUserId] = [];
		}

		chats.value[data.senderUserId]?.push({
			message: data.message,
			avatarType: AvatarType.VISITOR
		});
	}
});

watch(isChatModalVisible, (newValue, oldValue) => {
	if (newValue && newValue !== oldValue) {
		// Disable interactivity
		ExperienceManager.instance.setInteractiveState(false);

		return;
	}

	// Enable interactivity
	ExperienceManager.instance.setInteractiveState(true);
});

// Lifecycle hooks
onMounted(() => {
	if (canvas.value) {
		// Initialize the experience manager
		ExperienceManager.instance.init(canvas.value, username, selectedAvatarId);

		// Add all scenes to ThreeManager
		ExperienceManager.instance.addScene(
			SceneKey.LANDING_AREA,
			new LandingAreaScene(canvas.value, SceneKey.LANDING_AREA)
		);
		ExperienceManager.instance.addScene(
			SceneKey.MEETING_ROOM,
			new MeetingRoomScene(canvas.value, SceneKey.MEETING_ROOM)
		);
		ExperienceManager.instance.addScene(SceneKey.CHAT_ROOM, new ChatRoomScene(canvas.value, SceneKey.CHAT_ROOM));

		// Listen for ready event
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
		<div class="absolute top-5 left-5 z-10 flex items-center justify-center gap-2">
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

		<ChatList :chats="chats" @open-chat-modal="openChatModal" />

		<ChatModal
			:show="isChatModalVisible"
			:selected-chat-user-id="selectedChatUserId"
			:chats="chats"
			@submit-message="submitMessage"
			@close="closeChatModal"
		/>

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
