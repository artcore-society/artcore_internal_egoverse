import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';

export const useApplicationStore = defineStore('applicationStore', () => {
	// Set variables
	const currentStep: Ref<string> = ref('onboarding');

	// Define functions
	function next(step: string) {
		// Set ref
		currentStep.value = step;
	}

	return {
		next,
		currentStep
	};
});
