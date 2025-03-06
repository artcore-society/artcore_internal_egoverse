import { IDialog } from '../Interfaces/IDialog.ts';

export default class Dialog implements IDialog {
	public messages: Array<string> = [];
	constructor() {}
}
