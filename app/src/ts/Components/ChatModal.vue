<script setup lang="ts">
import { TYPE } from 'vue-toastification';
import { ref, onMounted, watch } from 'vue';
import { useClearToast, useShowToast } from '../Composables/Toastification.ts';
import InputField from './InputField.vue';
import PrimaryButton from './PrimaryButton.vue';
import ExperienceManager from '../Classes/ExperienceManager.ts';
import Modal from './Modal.vue';

// Props
const props = defineProps<{
	show: boolean;
	selectedChatUserId: string | null;
	chats: Record<string, Array<{ message: string; avatarType: string }>>;
}>();

// Emit events
const emit = defineEmits<{
	(e: 'close'): void;
	(e: 'submit-message', message: string): void;
}>();

// Reactive state
const currentPlayerMessage = ref('');

// Methods
const closeChatModal = () => {
	emit('close');
};

const submitMessage = () => {
	if (!currentPlayerMessage.value || !currentPlayerMessage.value.trim()) {
		const errorId: string = 'empty-input-error';

		// Clear toasts
		useClearToast(errorId);

		// Trigger toast
		useShowToast('Error', "Submitted field can't be empty.", TYPE.ERROR, {
			id: errorId
		});

		return;
	}

	// Emit message submission here (replace with your logic)
	emit('submit-message', currentPlayerMessage.value);

	// Clear type message
	currentPlayerMessage.value = null;
};

// Scroll to the bottom when new messages are added
const chatContainer = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
	if (chatContainer.value) {
		chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
	}
};

onMounted(() => {
	scrollToBottom();
});

watch(
	() => props.chats[props.selectedChatUserId],
	() => {
		scrollToBottom();
	}
);
</script>

<template>
	<Modal :show="show" max-width="md" @close="closeChatModal">
		<div class="flex w-full flex-col gap-12">
			<div class="flex w-full flex-col gap-4">
				<div
					v-if="
						ExperienceManager.instance.activeScene &&
						selectedChatUserId &&
						ExperienceManager.instance.activeScene.players[selectedChatUserId]
					"
					class="text-center text-lg font-bold"
				>
					Chat with
					{{ ExperienceManager.instance.activeScene.players[selectedChatUserId].username }}
				</div>

				<Transition name="fade" mode="out-in" appear>
					<TransitionGroup
						v-if="selectedChatUserId && chats[selectedChatUserId]"
						ref="chatContainer"
						name="list"
						tag="div"
						class="flex flex-col gap-2"
					>
						<div
							v-for="(chat, index) in chats[selectedChatUserId] || []"
							:key="`chat-${index}`"
							:class="{
								'bg-gray-500 text-left text-white': !chat.isCurrentPlayer,
								'bg-amber-400 text-right text-white': chat.isCurrentPlayer
							}"
							class="rounded-lg p-3 font-bold break-all shadow-xl"
						>
							{{ chat.message }}
						</div>
					</TransitionGroup>

					<span v-else class="font-bold">No messages...</span>
				</Transition>
			</div>

			<form class="flex flex-col gap-2" @submit.prevent="submitMessage">
				<InputField v-model="currentPlayerMessage" placeholder="Type message here" type="text" class="w-full" />

				<PrimaryButton type="submit"> Submit </PrimaryButton>
			</form>
		</div>
	</Modal>
</template>
