import { IBaseCharacter } from '../Interfaces/IBaseCharacter.ts';
import { Vector3, Quaternion } from 'three';

export class BaseCharacter implements IBaseCharacter {
    username: string;
    modelId: number;
    sceneKey: string;
    position: Vector3;
    quaternion: Quaternion;

    constructor(username: string, modelId: number, sceneKey: string, spawnPosition: Vector3 = new Vector3(), spawnRotation: Quaternion = new Quaternion()) {
        this.username = username;
        this.modelId = modelId;
        this.sceneKey = sceneKey;
        this.position = spawnPosition;
        this.quaternion = spawnRotation;
    }

    updatePositionAndRotation(position: Vector3, quaternion: Quaternion): void {
        this.position.copy(position);
        this.quaternion.copy(quaternion);
    }
}
