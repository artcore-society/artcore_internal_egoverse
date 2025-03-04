import { Vector3, Quaternion } from 'three';

export interface IPlayer {
    id: string;
    username: string;
    playerId: string;
    position: Vector3;
    quaternion: Quaternion;
    isCurrent: boolean;

    updatePositionAndRotation(position: Vector3, quaternion: Quaternion): void;
}
