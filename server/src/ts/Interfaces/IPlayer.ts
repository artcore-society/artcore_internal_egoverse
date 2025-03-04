import { Vector3, Quaternion } from 'three';

export interface IPlayer {
    id: string;
    username: string;
    modelId: string;
    position: Vector3;
    quaternion: Quaternion;

    updatePositionAndRotation(position: Vector3, quaternion: Quaternion): void;
}
