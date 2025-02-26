<script setup lang="ts">
// Define props
import HandIcon from './Icons/HandPointerIcon.vue';

defineProps<{
  asset: string,
  name: string
}>();
</script>

<template>
  <div
      class="group relative h-40 aspect-square rounded-full border-8 border-amber-100 overflow-hidden select-none"
  >
    <HandIcon
        class="absolute z-10 top-1/2 left-1/2 -translate-y-1/2 text-amber-100 -translate-x-1/2 h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    />

    <img
        :src="asset"
        class="relative z-0 h-full w-full object-cover"
        :alt="`avatar image of ${name}`"
    >

    <div
        class="absolute z-0 inset-0 bg-cyan-600 opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex justify-center items-center"
    />
  </div>
</template>
