import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';

export const useAvatarStore = defineStore('avatarStore', () => {
	// State variables
	const username: Ref<string> = ref('');
	const modelId: Ref<number> = ref(1);
	const avatars: Ref<Array<{ id: number; asset: string; name: string }>> = ref([
		{ id: 1, asset: '/assets/images/avatars/1.jpg', name: 'Worker' },
		{ id: 2, asset: '/assets/images/avatars/2.jpg', name: 'Knight' },
		{ id: 3, asset: '/assets/images/avatars/3.jpg', name: 'Mouse' },
		{ id: 4, asset: '/assets/images/avatars/4.jpg', name: 'Elvis' },
		{ id: 5, asset: '/assets/images/avatars/5.jpg', name: 'Doozy' }
	]);

	// Methods
	const selectAvatar = (id: number) => {
		if (avatars.value.some((player) => player.id === id)) {
			modelId.value = id;
		}
	};

	return {
		username,
		modelId,
		avatars,
		selectAvatar
	};
});
