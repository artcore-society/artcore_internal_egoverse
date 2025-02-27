<script setup lang="ts">
import { defineProps } from 'vue';

// Define props
defineProps<{
	title?: string;
	text?: string;
}>();
</script>

<template>
	<div>
		<strong v-if="title">{{ title }}</strong>
		<p v-if="text">{{ text }}</p>
	</div>
</template>
