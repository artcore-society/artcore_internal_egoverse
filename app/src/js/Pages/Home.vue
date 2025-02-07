<script setup lang="ts">
import {io} from 'socket.io-client';
import PrimaryButton from '../Components/PrimaryButton.vue';

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
	<div class="relative flex h-[100dvh] w-screen items-stretch justify-center">
    <span>Home</span>
    <PrimaryButton/>  
	</div>
</template>
