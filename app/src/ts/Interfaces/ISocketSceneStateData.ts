import { Vector3, Quaternion } from 'three';

export interface ISocketSceneStateData {
	sceneKey: string;
	currentPlayer: {
		id: string;
		username: string;
		modelId: string;
		position: Vector3;
		quaternion: Quaternion;
	};
	visitors: Array<{
		id: string;
		modelId: string;
		isCurrent: boolean;
		username: string;
		position: Array<number>;
		quaternion: Array<number>;
	}>;
}
