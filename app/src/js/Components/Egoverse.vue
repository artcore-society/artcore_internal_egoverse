<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { io } from 'socket.io-client';
import { SceneKey } from '../Enums/SceneKey';
import { LandingAreaScene } from '../Classes/LandingAreaScene';
import { MeetingRoomScene } from '../Classes/MeetingRoomScene';
import { ChatRoomScene } from '../Classes/ChatRoomScene';
import ThreeManager from '../Classes/ThreeManager';
import PrimaryButton from './PrimaryButton.vue';

// Socket setup
const socket = io('ws://localhost:3000');

socket.on('connect', () => {
	console.log('Connected with socket id:', socket.id);
});

socket.on('disconnect', () => {
	console.log('Disconnected from socket id:', socket.id);
});

// Set variables
const canvas = ref<HTMLCanvasElement | null>(null);
let threeManager: ThreeManager | null = null;

function transitionToScene(sceneKey: SceneKey) {
	threeManager?.setActiveScene(sceneKey);
}

// Lifecycle hooks
onMounted(() => {
	if (canvas.value) {
		// Create manage instance
		threeManager = new ThreeManager(canvas.value);

		// Add all scenes to ThreeManager
		threeManager.addScene(SceneKey.LANDING_AREA, new LandingAreaScene(canvas.value));
		threeManager.addScene(SceneKey.MEETING_ROOM, new MeetingRoomScene(canvas.value));
		threeManager.addScene(SceneKey.CHAT_ROOM, new ChatRoomScene(canvas.value));

		// Initially set the default active scene
		threeManager.setActiveScene(SceneKey.LANDING_AREA);
	}
});

onBeforeUnmount(() => {
	if (threeManager) {
		threeManager.destroy();
	}
});
</script>

<template>
  <div class="absolute top-5 left-5 z-10 flex justify-center items-center gap-2">
    <PrimaryButton
        @click="transitionToScene(SceneKey.LANDING_AREA)"
        class="px-4 py-2 bg-green-500 text-white rounded-lg"
    >
      Landing Area
    </PrimaryButton>

    <PrimaryButton
        @click="transitionToScene(SceneKey.MEETING_ROOM)"
        class="px-4 py-2 bg-red-500 text-white rounded-lg"
    >
      Meeting Room
    </PrimaryButton>

    <PrimaryButton
        @click="transitionToScene(SceneKey.CHAT_ROOM)"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      Chat Room
    </PrimaryButton>
  </div>

  <canvas ref="canvas" class="h-full w-full"/>
</template>
