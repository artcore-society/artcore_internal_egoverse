import { Object3D, Scene } from 'three';
import ExperienceCamera from '../Classes/ExperienceCamera.ts';

export interface IThreeScene {
    scene: Scene;
    camera: ExperienceCamera;
    cameraParent: Object3D;
    updateAction: ((delta: number) => void) | null;

    setupFloor(color: string): void;
    update(delta: number): void;
    destroy(): void;
}