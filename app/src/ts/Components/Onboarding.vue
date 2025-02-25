<script setup lang="ts">
import { ref } from 'vue';
import { useAvatarStore } from '../Stores/AvatarStore.ts';
import AvatarOption from './AvatarOption.vue';
import PrimaryButton from './PrimaryButton.vue';
import InputField from './InputField.vue';

// Define emits
const emit = defineEmits<{
  (e: 'next'): void
}>();

// Store
const avatarStore = useAvatarStore();

// Set variables
const step = ref(1);

// Define functions
function handleAvatarSelection(id: number) {
	// Select avatar
	avatarStore.selectAvatar(id);

	// Move to the next step
	step.value = 2; 
}

// Handle username confirmation
const confirmUsername = () => {
	// Trim and update the store value
	// username = username.trim();
	console.log('username: ', avatarStore.username);

	// Emit to go to next step
	emit('next');
};
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4">
     <span class="text-2xl font-bold">
      {{ step === 1 ? 'Choose your avatar!' : 'Enter your username' }}
    </span>

    <Transition name="fade" mode="out-in" appear>
      <div v-if="step === 1" class="flex flex-wrap justify-center items-center gap-2">
        <AvatarOption
            v-for="(option, index) in avatarStore.avatars"
            :key="`option-${index + 1}`"
            :asset="option.asset"
            :name="option.name"
            class="h-40 aspect-square rounded-full overflow-clip border-4 border-blue-400 cursor-pointer"
            @click="handleAvatarSelection(option.id)"
        />
      </div>

      <form v-else @submit.prevent="confirmUsername" class="flex flex-col justify-center items-start gap-4 w-full">
        <InputField v-model="avatarStore.username" type="text" placeholder="Type username here"/>

        <PrimaryButton type="submit">
          Confirm
        </PrimaryButton>
      </form>
    </Transition>
  </div>
</template>
