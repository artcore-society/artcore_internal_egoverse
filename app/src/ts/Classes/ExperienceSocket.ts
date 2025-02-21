import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '../Enums/SocketEvent';

export class ExperienceSocket {
	private static _instance: ExperienceSocket;
	private socket: Socket;

	private constructor() {
		this.socket = io('ws://localhost:3000', {
			query: {
				username: 'test avatar player',
			},
		});
	}

	public static get instance(): ExperienceSocket {
		if (!ExperienceSocket._instance) {
			ExperienceSocket._instance = new ExperienceSocket();
		}
		return ExperienceSocket._instance;
	}

	public static on<T>(event: SocketEvent, callback: (data: T) => void) {
		ExperienceSocket.instance.socket.on(event, callback);
	}

	public static emit(event: SocketEvent, data: unknown) {
		ExperienceSocket.instance.socket.emit(event, data);
	}
}