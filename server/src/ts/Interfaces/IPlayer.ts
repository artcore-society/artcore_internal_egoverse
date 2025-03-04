import { Vector3, Quaternion } from 'three';

export interface IPlayer {
    id: string;
    username: string;
    avatarId: string;
    position: Vector3;
    rotation: Quaternion;
    isCurrent: boolean;

    updatePosition(position: Vector3, rotation: Quaternion): void;
}
