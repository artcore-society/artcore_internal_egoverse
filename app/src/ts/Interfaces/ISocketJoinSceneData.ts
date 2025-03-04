import { SceneKey } from '../Enums/SceneKey.ts';
import { Quaternion, Vector3 } from 'three';

export interface ISocketJoinSceneData {
	sceneKey: SceneKey;
	userId: string;
	username: string;
	modelId: string;
	spawnPosition: Vector3;
	spawnRotation: Quaternion;
}
