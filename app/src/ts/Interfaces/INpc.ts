import { IDialog } from './IDialog.ts';

export interface INpc {
	dialog: IDialog;

	startDialog(): Promise<void>;
}
