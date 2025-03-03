import { Vector3, Euler } from 'three';

export interface IPlayer {
    id: string;
    username: string;
    avatarId: string;
    position: Vector3;
    rotation: Euler;
    isCurrent: boolean;

    updatePosition(position: Vector3, rotation: Euler): void;
}
