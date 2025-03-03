import { SceneKey } from '../Enums/SceneKey.ts';
import { Quaternion, Vector3 } from 'three';

export interface ISocketInitData {
	id: string;
	currentSceneKey: string;
	scenes: Array<{
		sceneKey: SceneKey;
		currentPlayer: {
			id: string;
			username: string;
			avatarId: number;
			isCurrent: boolean;
			position: Vector3;
			rotation: Quaternion;
		};
		visitors: Array<{
			id: string;
			username: string;
			avatarId: number;
			isCurrent: boolean;
			position: Vector3;
			rotation: Quaternion;
		}>;
	}>;
}
