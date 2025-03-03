import { Vector3, Euler } from 'three';
import { IPlayer } from '../Interfaces/IPlayer';

export class Player implements IPlayer {
    id: string;
    username: string;
    avatarId: string;
    sceneKey: string;
    position: Vector3;
    rotation: Euler;
    isCurrent: boolean;

    constructor(id: string, username: string, avatarId: string, sceneKey: string, isCurrent = false) {
        this.id = id;
        this.username = username;
        this.avatarId = avatarId;
        this.sceneKey = sceneKey;
        this.position = new Vector3();
        this.rotation = new Euler();
        this.isCurrent = isCurrent;
    }

    updatePosition(position: Vector3, rotation: Euler): void {
        this.position.copy(position);
        this.rotation.copy(rotation);
    }
}
