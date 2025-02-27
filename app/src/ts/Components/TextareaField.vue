<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// Define emits
const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

// Define props
withDefaults(
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
		maxLength: 255,
	}
);
</script>

<template>
	<textarea
      class="rounded-md bg-white border-2 border-amber-100 focus:border-cyan-600 text-black transition-opacity duration-500 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-cyan-600 px-2"
      :class="{ 'opacity-50': disabled }"
      :value="modelValue"
      :rows="rows"
      :cols="cols"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxLength"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
