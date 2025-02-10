import { Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ExperienceCamera from '../Classes/ExperienceCamera.ts';
import ExperienceRenderer from '../Classes/ExperienceRenderer.ts';

export interface IExperienceScene {
    scene: Scene;
    camera: ExperienceCamera;
    renderer: ExperienceRenderer;
    controls: OrbitControls;
    renderAction: ((delta: number) => void) | null;

    setRenderAction(callback: (delta: number) => void): void;
    resize(): void;
    render(delta: number): void;
    destroy(): void;
    update(delta: number): void;
}
