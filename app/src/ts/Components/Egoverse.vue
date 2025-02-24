<script setup lang="ts">
import { SceneKey } from '../Enums/SceneKey';
import { SocketEvent } from '../Enums/SocketEvent.ts';
import { EventService } from '../Services/EventService.ts';
import { ChatRoomScene } from '../Classes/ChatRoomScene';
import { CustomEventKey } from '../Enums/CustomEventKey.ts';
import { LandingAreaScene } from '../Classes/LandingAreaScene';
import { MeetingRoomScene } from '../Classes/MeetingRoomScene';
import { ExperienceSocket } from '../Classes/ExperienceSocket.ts';
import { ComponentPublicInstance, onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';
import ExperienceManager from '../Classes/ExperienceManager.ts';
import PrimaryButton from './PrimaryButton.vue';
import Loader from './Loader.vue';
import Modal from './Modal.vue';
import InputField from './InputField.vue';

// Set variables
const message: Ref<string> = ref(null);
const isModalVisible: Ref<boolean> = ref(false);
const isReady: Ref<boolean> = ref(false);
const canvas: Ref<HTMLCanvasElement | null> = ref(null);
const areaButtons: Ref<Record<SceneKey, HTMLElement>> = ref({} as Record<SceneKey, HTMLElement>);

// Define functions
function transitionToScene(sceneKey: SceneKey): void {
	if(areaButtons.value[sceneKey]) {
		// Blur focus button
		areaButtons.value[sceneKey].blur();
	}

	ExperienceManager.instance.setActiveScene(sceneKey);
}

function setReadyState(): void {
	// Set ready state
	isReady.value = true;
}

function close() {
	// Set ref
	isModalVisible.value = false;
	message.value = null;

	// Reset hovered avatar
	ExperienceManager.instance.selectedAvatar.value = null;
}

function submit() {
	if(!ExperienceManager.instance.activeScene || !ExperienceManager.instance.selectedAvatar.value) {
		return;
	}

	// Get visitor id to send message to via websockets by retrieving it from visitors list/object (keys are the visitor id's)
	const visitorId = Object.keys(ExperienceManager.instance.activeScene.visitorAvatars).find(key => {
		return ExperienceManager.instance.activeScene.visitorAvatars[key].model.uuid === ExperienceManager.instance.selectedAvatar.value.model.uuid;
	});

	// Send message via websockets
	ExperienceSocket.emit(SocketEvent.SEND_MESSAGE, {
		visitorId: visitorId,
		message: message.value
	});

	// Close modal
	close();
}

// Watch
watch(ExperienceManager.instance.selectedAvatar, value => {
	// Set ref
	isModalVisible.value = !!value;
});

// Lifecycle hooks
onMounted(() => {
	if (canvas.value) {
		// Initialize the experience manager
		ExperienceManager.instance.init(canvas.value);

		// Add all scenes to ThreeManager
		ExperienceManager.instance.addScene(SceneKey.LANDING_AREA, new LandingAreaScene(canvas.value, SceneKey.LANDING_AREA));
		ExperienceManager.instance.addScene(SceneKey.MEETING_ROOM, new MeetingRoomScene(canvas.value, SceneKey.MEETING_ROOM));
		ExperienceManager.instance.addScene(SceneKey.CHAT_ROOM, new ChatRoomScene(canvas.value, SceneKey.CHAT_ROOM));

		// Listen for ready event
		EventService.listen(CustomEventKey.READY, setReadyState);
	}
});

onBeforeUnmount(() => {
	if (ExperienceManager.instance) {
		ExperienceManager.instance.destroy();
	}

	// Remove listeners
	EventService.remove(CustomEventKey.READY, setReadyState);
});
</script>

<template>
  <div class="absolute top-5 left-5 z-10 flex justify-center items-center gap-2">
    <Loader v-if="!isReady"/>

    <Modal :show="isModalVisible" max-width="md" @close="close">
      <div class="flex flex-col justify-center items-start gap-4 w-full">
        <span class="text-2xl">Send message to avatar</span>

        <InputField v-model="message" type="text" class="w-full" />

        <PrimaryButton @click="submit">
          Submit
        </PrimaryButton>
      </div>
    </Modal>

    <PrimaryButton
        @click="transitionToScene(SceneKey.LANDING_AREA)"
        :ref="el => areaButtons[SceneKey.LANDING_AREA] = (el as ComponentPublicInstance).$el as HTMLElement"
        class="px-4 py-2 bg-green-500 text-white rounded-lg"
    >
      Landing Area
    </PrimaryButton>

    <PrimaryButton
        @click="transitionToScene(SceneKey.MEETING_ROOM)"
        :ref="el => areaButtons[SceneKey.MEETING_ROOM] = (el as ComponentPublicInstance).$el as HTMLElement"
        class="px-4 py-2 bg-red-500 text-white rounded-lg"
    >
      Meeting Room
    </PrimaryButton>

    <PrimaryButton
        @click="transitionToScene(SceneKey.CHAT_ROOM)"
        :ref="el => areaButtons[SceneKey.CHAT_ROOM] = (el as ComponentPublicInstance).$el as HTMLElement"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      Chat Room
    </PrimaryButton>
  </div>

  <canvas ref="canvas" class="h-full w-full"/>
</template>
