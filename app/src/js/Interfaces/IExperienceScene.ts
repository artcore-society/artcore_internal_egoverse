import { Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ExperienceCamera from '../Classes/ExperienceCamera.ts';

export interface IExperienceScene {
    scene: Scene;
    camera: ExperienceCamera;
    controls: OrbitControls;
    renderAction: ((delta: number) => void) | null;

    setRenderAction(callback: (delta: number) => void): void;
    setSceneSize(): void;
    resize(): void;
    render(delta: number): void;
    destroy(): void;
    pause(): void;
    resume(): void;
}