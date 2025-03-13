<script setup lang="ts">
import { onMounted, ref } from 'vue';

// Define emits
const emit = defineEmits(['update:modelValue']);

// Define props
defineProps({
	modelValue: [String, null],
	disabled: Boolean,
	required: {
		type: Boolean,
		default: false
	}
});

// Set variables
const input = ref<HTMLInputElement | null>(null);

// Life cycles
onMounted(() => {
	if (input.value?.hasAttribute('autofocus')) {
		input.value.focus();
	}
});

// Define expose
defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
	<input
		ref="input"
		type="text"
		class="shadow-bottom-right h-10 min-h-10 rounded-md border-2 border-amber-100 bg-white px-2 text-ellipsis text-black placeholder-black focus:border-cyan-600 focus:ring-cyan-600 focus:outline-none lg:rounded-lg"
		:class="{
			'opacity-25': disabled
		}"
		:disabled="disabled"
		:required="required"
		@input="emit('update:modelValue', input?.value)"
	/>
</template>
