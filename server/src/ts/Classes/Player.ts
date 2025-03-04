import { IPlayer } from '../Interfaces/IPlayer';
import { Vector3, Quaternion } from 'three';

export class Player implements IPlayer {
    id: string;
    username: string;
    modelId: string;
    sceneKey: string;
    position: Vector3;
    quaternion: Quaternion;

    constructor(id: string, username: string, modelId: string, sceneKey: string) {
        this.id = id;
        this.username = username;
        this.modelId = modelId;
        this.sceneKey = sceneKey;
        this.position = new Vector3();
        this.quaternion = new Quaternion();
    }

    updatePositionAndRotation(position: Vector3, quaternion: Quaternion): void {
        this.position.copy(position);
        this.quaternion.copy(quaternion);
    }
}
