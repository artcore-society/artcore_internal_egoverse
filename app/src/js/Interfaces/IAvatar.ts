import { Object3D, Scene } from 'three';

export interface IAvatar {
    scene: Scene;
    model: Object3D | null;
}