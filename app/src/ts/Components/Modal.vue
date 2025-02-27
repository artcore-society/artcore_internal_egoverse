<script setup lang="ts">
import { computed, defineEmits, onMounted, onUnmounted, watch } from 'vue';

// Define emits
const emit = defineEmits<{
  (e: 'close'): void
}>();

// Define props
const props = defineProps({
	show: {
		type: Boolean,
		default: false
	},
	maxWidth: {
		type: String,
		default: '2xl'
	},
	closeable: {
		type: Boolean,
		default: true
	}
});

// Define computed variable
const maxWidthClass = computed(() => {
	return {
		fit: 'sm:max-w-fit',
		sm: 'sm:max-w-sm',
		md: 'sm:max-w-md',
		lg: 'sm:max-w-lg',
		xl: 'sm:max-w-xl',
		'2xl': 'sm:max-w-2xl'
	}[props.maxWidth];
});

// Watch
watch(
	() => props.show,
	() => {
		if (props.show) {
			document.body.classList.add('overflow-hidden');
		} else {
			document.body.classList.remove('overflow-hidden');
		}
	}
);

// Define functions
function close() {
	if (props.closeable) {
		emit('close');
	}
}

function closeOnEscape(event) {
	if (event.key === 'Escape' && props.show) {
		close();
	}
};

// Life cycles
onMounted(() => {
	document.addEventListener('keydown', closeOnEscape);
});

onUnmounted(() => {
	document.removeEventListener('keydown', closeOnEscape);
	document.body.style.overflow = null;
});
</script>

<template>
	<Teleport to="body">
		<Transition leave-active-class="duration-200">
			<div
				v-show="show"
				class="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-0"
				scroll-region
			>
				<Transition
					enter-active-class="ease-out duration-300"
					enter-from-class="opacity-0"
					enter-to-class="opacity-100"
					leave-active-class="ease-in duration-200"
					leave-from-class="opacity-100"
					leave-to-class="opacity-0"
				>
					<div v-show="show" class="fixed inset-0 transform transition-all" @click="close">
						<div class="absolute inset-0 cursor-pointer bg-app-primary-100/60" />
					</div>
				</Transition>

				<Transition
					enter-active-class="ease-out duration-300"
					enter-from-class="opacity-0 scale-95"
					enter-to-class="opacity-100 scale-100"
					leave-active-class="ease-in duration-200"
					leave-from-class="opacity-100 scale-100"
					leave-to-class="opacity-0 scale-95"
				>
					<div
						v-if="show"
						class="relative z-50 flex w-full cursor-default flex-col items-center justify-center gap-4 bg-app-secondary-10 p-4 rounded-md text-center text-app-primary-100 shadow-2xl bg-cyan-400"
						:class="maxWidthClass"
					>
						<slot />
					</div>
				</Transition>
			</div>
		</Transition>
	</Teleport>
</template>
