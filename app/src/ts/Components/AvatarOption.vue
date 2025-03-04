<script setup lang="ts">
// Define props
import HandIcon from './Icons/HandPointerIcon.vue';

defineProps<{
	asset: string;
	name: string;
}>();
</script>

<template>
	<div class="group relative aspect-square h-40 overflow-hidden rounded-full border-8 border-amber-100 select-none">
		<HandIcon
			class="absolute top-1/2 left-1/2 z-10 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-amber-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		/>

		<img :src="asset" class="relative z-0 h-full w-full object-cover" :alt="`player image of ${name}`" />

		<div
			class="absolute inset-0 z-0 flex items-center justify-center bg-cyan-600 opacity-0 transition-opacity duration-300 group-hover:opacity-80"
		/>
	</div>
</template>
