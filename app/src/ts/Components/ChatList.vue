<script setup lang="ts">
import { computed, defineEmits } from 'vue';
import ExperienceManager from '../Classes/ExperienceManager.ts';
import PrimaryButton from './PrimaryButton.vue';

// Define emits
const emit = defineEmits<{
	(e: 'open-chat-modal', visitorId: string): void;
}>();

// Define props
const props = defineProps<{
	chats: Record<string, Array<{ message: string; isCurrentPlayer: boolean }>>;
}>();

// Set computed variable
const hasChats = computed(() => Object.keys(props.chats).length > 0);
</script>

<template>
	<Transition name="fade" mode="out-in" appear>
		<div v-if="hasChats" class="absolute bottom-2 left-2 z-10 flex flex-col gap-4">
			<div
				v-for="visitorId in Object.keys(chats)"
				:key="visitorId"
				class="flex min-w-42 flex-col gap-2 rounded-md bg-cyan-400 p-2 text-white shadow-xl"
			>
				<div v-if="ExperienceManager.instance.activeScene?.players[visitorId]" class="text-center text-lg font-bold">
					{{ ExperienceManager.instance.activeScene.players[visitorId].username }}
				</div>

				<PrimaryButton @click="emit('open-chat-modal', visitorId)">Chat</PrimaryButton>
			</div>
		</div>

		<div
			v-else
			class="absolute bottom-2 left-2 z-10 flex flex-col gap-4 rounded-md bg-cyan-400 p-2 font-bold text-white shadow-xl"
		>
			No chats...
		</div>
	</Transition>
</template>
