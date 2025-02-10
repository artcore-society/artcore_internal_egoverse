import { Object3D, Scene } from 'three';
import ExperienceCamera from '../Classes/ExperienceCamera.ts';

export interface IExperienceScene {
    scene: Scene;
    camera: ExperienceCamera;
    cameraParent: Object3D;
    updateAction: ((delta: number) => void) | null;

    setupLighting(): void;
    setUpdateAction(callback: (delta: number) => void): void;
    update(delta: number): void;
    destroy(): void;
}