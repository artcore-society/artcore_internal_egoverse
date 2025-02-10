// ExperienceScene.ts
import { Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IExperienceScene } from '../Interfaces/IExperienceScene';
import ExperienceCamera from './ExperienceCamera.ts';
import ExperienceRenderer from './ExperienceRenderer.ts';

export default abstract class ExperienceScene implements IExperienceScene {
	public readonly scene: Scene;
	public readonly camera: ExperienceCamera;
	public readonly renderer: ExperienceRenderer;
	public readonly controls: OrbitControls;
	public renderAction: ((delta: number) => void) | null;

	protected constructor(canvas: HTMLCanvasElement) {
		this.scene = new Scene();
		this.camera = new ExperienceCamera(this.scene, canvas);
		this.renderer = new ExperienceRenderer(canvas);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.renderAction = null;
	}

	setRenderAction(callback: (delta: number) => void): void {
		this.renderAction = callback;
	}

	resize(): void {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	render(delta: number): void {
		this.controls.update();
		if (this.renderAction) {
			this.renderAction(delta);
		}
		this.renderer.render(this.scene, this.camera);
	}

	destroy(): void {
		this.renderer.dispose();
	}

	abstract update(delta: number): void
}