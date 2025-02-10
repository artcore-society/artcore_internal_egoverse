<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { io } from 'socket.io-client';
import { SceneKey } from '../Enums/SceneKey';
import { LandingAreaScene } from '../Classes/LandingAreaScene';
import { MeetingRoomScene } from '../Classes/MeetingRoomScene';
import { ChatRoomScene } from '../Classes/ChatRoomScene';
import ThreeManager from '../Classes/ThreeManager';

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
let threeManager: ThreeManager | null = null; // ThreeManager instance

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
  <canvas ref="canvas" class="h-full w-full"/>
</template>
