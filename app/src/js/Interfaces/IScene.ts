import { Scene } from 'three';
import ExperienceCamera from '../Classes/ExperienceCamera.ts';

export interface IScene {
    scene: Scene;
    camera: ExperienceCamera;
    updateAction: ((delta: number) => void) | null;

    setupLighting(): void;
    setUpdateAction(callback: (delta: number) => void): void;
    setSceneSize(): void;
    resize(): void;
    update(delta: number): void;
    destroy(): void;
}