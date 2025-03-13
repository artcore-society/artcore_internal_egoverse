import { CustomEventKey } from '../Enums/CustomEventKey.ts';

export class EventService {
	private static events: Record<string, Array<(payload?: unknown) => void>> = {};
	private static baseKey = 'CustomEvent';

	// Generate the full event key
	private static getKey(eventName: CustomEventKey): string {
		return `${EventService.baseKey}-${eventName}`;
	}

	// Register a listener for an event
	static listen<T = unknown>(eventName: CustomEventKey, callback: (payload?: T) => void): void {
		const key = EventService.getKey(eventName);
		if (!this.events[key]) {
			this.events[key] = [];
		}
		this.events[key].push(callback as (payload?: unknown) => void);
	}

	// Dispatch an event with optional data
	static dispatch<T = unknown>(eventName: CustomEventKey, payload?: T): void {
		const key = EventService.getKey(eventName);
		if (this.events[key]) {
			this.events[key].forEach((callback) => callback(payload));
		}
	}

	// Remove a specific listener or all listeners for an event
	static remove<T = unknown>(eventName: CustomEventKey, callback: (payload?: T) => void): void {
		const key = EventService.getKey(eventName);
		if (!this.events[key]) return;

		if (callback) {
			this.events[key] = this.events[key].filter((cb) => cb !== callback);
		} else {
			delete this.events[key];
		}
	}
}
