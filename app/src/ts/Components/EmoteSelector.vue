<script setup lang="ts">
import { computed, ref, Ref } from 'vue';
import { IEmoteOption } from '../Interfaces/IEmoteOption';
import { AnimationName } from '../Enums/AnimationName.ts';
import Modal from './Modal.vue';
import ExperienceManager from '../Classes/ExperienceManager.ts';

// Define emits
const emit = defineEmits<{
	(e: 'close'): void;
}>();

// Define props
withDefaults(
	defineProps<{
		show: boolean;
	}>(),
	{
		show: false
	}
);

// Set variables
const offset: number = 70;
const hoveredEmote: Ref<IEmoteOption | null> = ref(null);
const circleRadius: Ref<number> = ref(325);
const emotes = ref<IEmoteOption[]>([
	{ asset: '/assets/videos/dancing.webm', animationName: AnimationName.DANCING },
	{ asset: '/assets/videos/waving.webm', animationName: AnimationName.WAVING },
	{ asset: '/assets/videos/taunting.webm', animationName: AnimationName.TAUNTING },
	{ asset: '/assets/videos/clapping.webm', animationName: AnimationName.CLAPPING },
	{ asset: '/assets/videos/flexing.webm', animationName: AnimationName.FLEXING },
	{ asset: '/assets/videos/cheering.webm', animationName: AnimationName.CHEERING }
]);

// Set computed variables
const emotePositions = computed(() => {
	return emotes.value.map((_, index) => {
		const angle = (360 / emotes.value.length) * index;
		// Adjust the translateY position with the offset
		return {
			transform: `rotate(${angle}deg) translateY(-${circleRadius.value - offset}px) rotate(-${angle}deg)`
		};
	});
});

// Define functions
function onClick(animationName: AnimationName) {
	if (
		ExperienceManager.instance.activeScene &&
		ExperienceManager.instance.activeScene.currentPlayerAvatar &&
		ExperienceManager.instance.activeScene.currentPlayerAvatar.controls
	) {
		ExperienceManager.instance.activeScene.currentPlayerAvatar.controls.emoteAnimationName = animationName;
	}

	// Close modal
	emit('close');
}
</script>

<template>
	<Modal :show="show" max-width="md" :transparent-background="true" @close="emit('close')">
		<div
			class="relative flex aspect-square items-center justify-center rounded-full shadow-2xl"
			:style="{ width: `${circleRadius * 2}px` }"
		>
			<div
				class="absolute inset-0 z-40 h-full w-full rounded-full bg-amber-100 shadow-2xl"
				style="
					mask-image: radial-gradient(circle, rgba(0, 0, 0, 0) 39%, rgba(0, 0, 0, 1) 40%, black 38%);
					mask-composite: exclude;
				"
			></div>

			<div
				v-for="(emote, index) in emotes"
				:key="`emote-${index}`"
				class="absolute z-50 flex h-[140px] w-20 cursor-pointer items-center justify-center font-bold text-black transition-colors hover:text-amber-400"
				:style="emotePositions[index]"
				@click="onClick(emote.animationName)"
				@pointermove="hoveredEmote = emote"
				@pointerleave="hoveredEmote = null"
			>
				{{ emote.animationName }}
			</div>

			<Transition name="fade" mode="out-in" appear>
				<video
					v-if="hoveredEmote"
					class="pointer-events-none z-10 h-[calc(650px-140px)] w-[calc(650px-140px)] overflow-hidden rounded-full object-cover"
					muted
					autoplay
					loop
				>
					<source :src="hoveredEmote.asset" type="video/webm" />
				</video>
			</Transition>
		</div>
	</Modal>
</template>
