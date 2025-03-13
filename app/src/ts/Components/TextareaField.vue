<script setup lang="ts">
import { defineProps, defineEmits, withDefaults } from 'vue';

// Define emits
const emit = defineEmits<{
	(event: 'update:modelValue', value: string): void;
}>();

// Define props with default values
const props = withDefaults(
	defineProps<{
		modelValue: string;
		value?: string;
		rows?: number;
		cols?: number;
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
		maxLength?: number;
	}>(),
	{
		value: '',
		rows: 3,
		cols: 30,
		placeholder: 'Enter text here...',
		disabled: false,
		readonly: false,
		maxLength: 255
	}
);
</script>

<template>
	<textarea
		class="rounded-md border-2 border-amber-100 bg-white px-2 text-black transition-opacity duration-500 focus:border-cyan-600 focus:border-transparent focus:ring-1 focus:ring-cyan-600 focus:outline-none"
		:class="{ 'opacity-50': props.disabled }"
		:value="props.modelValue"
		:rows="props.rows"
		:cols="props.cols"
		:placeholder="props.placeholder"
		:disabled="props.disabled"
		:readonly="props.readonly"
		:maxlength="props.maxLength"
		@input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
	/>
</template>
