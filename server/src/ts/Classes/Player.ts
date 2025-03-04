import { IPlayer } from '../Interfaces/IPlayer';
import { Vector3, Quaternion } from 'three';

export class Player implements IPlayer {
    id: string;
    username: string;
    avatarId: string;
    sceneKey: string;
    position: Vector3;
    quaternion: Quaternion;
    isCurrent: boolean;

    constructor(id: string, username: string, avatarId: string, sceneKey: string, isCurrent = false) {
        this.id = id;
        this.username = username;
        this.avatarId = avatarId;
        this.sceneKey = sceneKey;
        this.position = new Vector3();
        this.quaternion = new Quaternion();
        this.isCurrent = isCurrent;
    }

    updatePositionAndRotation(position: Vector3, quaternion: Quaternion): void {
        this.position.copy(position);
        this.quaternion.copy(quaternion);
    }
}
