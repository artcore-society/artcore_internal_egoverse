import { SceneKey } from '../Enums/SceneKey.ts';
import { Quaternion, Vector3 } from 'three';

export interface ISocketClientSpawnPlayerData {
	sceneKey: SceneKey;
	username: string;
	modelId: string;
	visitorId: string;
	spawnPosition: Vector3;
	spawnRotation: Quaternion;
}
