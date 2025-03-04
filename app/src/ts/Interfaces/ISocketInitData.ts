import { SceneKey } from '../Enums/SceneKey.ts';
import { Quaternion, Vector3 } from 'three';
import { ISceneSettings } from './ISceneSettings.ts';

export interface ISocketInitData {
	id: string;
	currentSceneKey: string;
	scenes: Array<{
		sceneKey: SceneKey;
		settings: ISceneSettings;
		currentPlayer: {
			id: string;
			username: string;
			playerId: number;
			isCurrent: boolean;
			position: Vector3;
			rotation: Quaternion;
		};
		visitors: Array<{
			id: string;
			username: string;
			playerId: number;
			isCurrent: boolean;
			position: Vector3;
			rotation: Quaternion;
		}>;
	}>;
}
