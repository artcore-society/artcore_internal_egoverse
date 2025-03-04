import { SceneKey } from '../Enums/SceneKey.ts';
import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '../Enums/SocketEvent';
import ExperienceManager from './ExperienceManager.ts';
import { useAvatarStore } from '../Stores/AvatarStore.ts';

export class ExperienceSocket {
	private static _instance: ExperienceSocket;
	private socket: Socket;

	private constructor() {
		// Avatar store
		const { selectedAvatarId } = useAvatarStore();

		// Create io instance
		this.socket = io('ws://localhost:3000', {
			query: {
				username: ExperienceManager.instance.username ?? 'Default username',
				selectedAvatarId: selectedAvatarId ?? 1,
				sceneKey: ExperienceManager.instance.activeScene?.sceneKey ?? SceneKey.LANDING_AREA
			}
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
