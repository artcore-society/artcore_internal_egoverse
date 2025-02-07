<script setup lang="ts">
import {io} from 'socket.io-client';

const socket = io('ws://localhost:3000');

// client-side
socket.on('connect', () => {
	console.log('connect: ',socket.id);
});

socket.on('disconnect', () => {
	console.log(socket.id);
});
</script>

<template>
  <canvas id="scene-canvas"/>
</template>
