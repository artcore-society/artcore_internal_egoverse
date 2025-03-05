import { IBaseCharacter } from '../Interfaces/IBaseCharacter.ts';
import { Vector3, Quaternion } from 'three';

export class BaseCharacter implements IBaseCharacter {
    username: string;
    modelId: number;
    position: Vector3;
    quaternion: Quaternion;

    constructor(username: string, modelId: number, spawnPosition: Vector3 = new Vector3(), spawnRotation: Quaternion = new Quaternion()) {
        this.username = username;
        this.modelId = modelId;
        this.position = spawnPosition;
        this.quaternion = spawnRotation;
    }

    updatePositionAndRotation(position: Vector3, quaternion: Quaternion): void {
        this.position.copy(position);
        this.quaternion.copy(quaternion);
    }
}
