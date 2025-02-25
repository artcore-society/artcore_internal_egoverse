<script setup lang="ts">
// Define props
defineProps<{
  asset: string,
  name: string
}>();
</script>

<template>
  <div
      class="h-40 aspect-square rounded-full overflow-clip border-4 border-blue-400"
  >
    <img
        :src="asset"
        class="h-full w-full object-cover"
        :alt="`avatar image of ${name}`"
    >
  </div>
</template>