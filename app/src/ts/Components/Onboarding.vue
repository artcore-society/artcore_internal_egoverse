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
  <div class="h-full w-full flex justify-center items-stretch bg-cyan-400 w-full overflow-hidden rounded-4xl">
    <Transition name="fade-scale" mode="out-in" appear>
      <div v-if="step === 1" class="flex flex-col justify-center items-center gap-12 ">
          <span class="text-8xl font-bold text-amber-100">
            {{ step === 1 ? 'Choose your avatar!' : 'Enter your username' }}
          </span>

        <div class="flex flex-wrap justify-center items-center gap-2">
          <AvatarOption
              v-for="(option, index) in avatarStore.avatars"
              :key="`option-${index + 1}`"
              :asset="option.asset"
              :name="option.name"
              class="cursor-pointer"
              @click="handleAvatarSelection(option.id)"
          />
        </div>
      </div>

      <div v-else class="flex flex-col justify-center items-center gap-12 ">
          <span class="text-8xl font-bold text-amber-100">
            {{ step === 1 ? 'Choose your avatar!' : 'Enter your username' }}
          </span>

        <form @submit.prevent="confirmUsername" class="flex flex-col justify-center items-start gap-4 w-full">
          <InputField v-model="avatarStore.username" type="text" placeholder="Type username here" class=""/>

          <PrimaryButton type="submit">
            Confirm
          </PrimaryButton>
        </form>
      </div>
    </Transition>
  </div>
</template>
