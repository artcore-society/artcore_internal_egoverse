export interface IDialog {
	messages: Array<string>;

	addMessage(message: string): void;
}
