<script setup lang="ts">
import { useApplicationStore } from '../Stores/ApplicationStore.ts';
import Egoverse from '../Components/Egoverse.vue';
import Onboarding from '../Components/Onboarding.vue';

// Store
const applicationStore = useApplicationStore();
</script>

<template>
  <div class="relative flex h-[100dvh] w-screen items-stretch justify-center">
    <Transition name="fade" mode="out-in" appear>
      <Onboarding
          v-if="applicationStore.currentStep === 'onboarding'"
          @next="applicationStore.next('egoverse')"
      />

      <Egoverse v-else-if="applicationStore.currentStep === 'egoverse'" />
    </Transition>
  </div>
</template>
