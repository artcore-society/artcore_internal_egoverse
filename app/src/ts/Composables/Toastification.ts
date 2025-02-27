import { ToastID } from 'vue-toastification/dist/types/types';
import { nextTick } from 'vue';
import { TYPE, useToast } from 'vue-toastification';
import { IToastOptions } from '../Interfaces/IToastOptions.ts';
import Toastification from '../Components/Toastification.vue';

async function useShowToast(
	title?: string,
	text?: string,
	type?: TYPE,
	options?: IToastOptions
) {
	// Set toast content and set default values
	const content = {
		component: Toastification,
		props: {
			title: title ?? '',
			text: text ?? ''
		},
		listeners: {
			click: () => options?.onClick ?? null
		}
	};

	await nextTick();

	switch (type) {
		case TYPE.ERROR:
			return useToast().error(content, options);
		case TYPE.WARNING:
			return useToast().warning(content, options);
		case TYPE.INFO:
			return useToast().info(content, options);
		case TYPE.SUCCESS:
			return useToast().success(content, options);
		default:
			return useToast()(content, options);
	}
}

async function useClearToast(id: ToastID) {
	await nextTick();
	if (id !== undefined) {
		useToast().dismiss(id);
	}
}

async function useClearToasts() {
	await nextTick();
	useToast().clear();
}

export { useShowToast, useClearToast, useClearToasts };
