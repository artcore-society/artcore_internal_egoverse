import { Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ExperienceCamera from '../Classes/ExperienceCamera.ts';

export interface IScene {
    scene: Scene;
    camera: ExperienceCamera;
    controls: OrbitControls;
    updateAction: ((delta: number) => void) | null;

    setUpdateAction(callback: (delta: number) => void): void;
    setSceneSize(): void;
    resize(): void;
    update(delta: number): void;
    destroy(): void;
}