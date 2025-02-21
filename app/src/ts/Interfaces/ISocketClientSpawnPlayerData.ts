import { SceneKey } from '../Enums/SceneKey.ts';
import { Quaternion, Vector3 } from 'three';

export interface ISocketClientSpawnPlayerData {
    sceneKey: SceneKey;
    visitorId: string;
    spawnPosition: Vector3;
    spawnRotation: Quaternion;
}