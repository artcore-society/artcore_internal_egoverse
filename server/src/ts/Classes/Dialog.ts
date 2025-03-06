import { IDialog } from '../Interfaces/IDialog.ts';

export default class Dialog implements IDialog {
	public messages: Array<string> = [];
	constructor() {}

	addMessage(message: string) {
		// Push trimmed message to list
		this.messages.push(message.trim());
	}
}
