<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';
import Modal from './Modal.vue';

// Define emits
const emit = defineEmits<{
	(e: 'close'): void;
}>();

// Define props
withDefaults(
	defineProps<{
		show: boolean;
		data: Array<{ instruction: string; labels: Array<string>; isCombination: boolean }>;
	}>(),
	{
		show: false
	}
);
</script>

<template>
	<Modal :show="show" max-width="lg" @close="emit('close')">
		<div class="flex w-full flex-col items-start justify-center gap-8">
			<span class="text-4xl font-bold">Key bindings</span>

			<div class="flex w-full flex-col gap-2">
				<div
					v-for="(item, index) in data"
					:key="`key-binding-data-${index + 1}`"
					class="2 flex items-center justify-between gap-2 border-2 border-amber-400 bg-white p-2"
				>
					<span class="font-bold">{{ item.instruction }}</span>

					<div class="flex flex-wrap items-center justify-start gap-2">
						<template v-for="(label, itemIndex) in item.labels" :key="`key-label-${itemIndex + 1}`">
							<span
								class="grid place-content-center rounded-md border-2 border-amber-400 bg-white px-2 py-1 font-bold uppercase"
							>
								{{ label }}
							</span>

							<span v-if="!item.isCombination && itemIndex !== item.labels.length - 1" class="font-bold">OR</span>
						</template>
					</div>
				</div>
			</div>
		</div>
	</Modal>
</template>
