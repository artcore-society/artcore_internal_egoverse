import { Scene } from 'three';
import { CameraControls } from '../Classes/CameraControls.ts';
import ExperienceCamera from '../Classes/ExperienceCamera.ts';

export interface IExperienceScene {
    scene: Scene;
    controls: CameraControls
    camera: ExperienceCamera;
    updateAction: ((delta: number) => void) | null;

    setupLighting(): void;
    setUpdateAction(callback: (delta: number) => void): void;
    setSceneSize(): void;
    resize(): void;
    update(delta: number): void;
    destroy(): void;
}