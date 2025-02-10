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

		// Set scene size
		this.setSceneSize();
	}

	setRenderAction(callback: (delta: number) => void): void {
		this.renderAction = callback;
	}

	setSceneSize() {
		// Set correct aspect
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		// Set canvas size again
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	resize(): void {
		// Set new scene size
		this.setSceneSize();
	}

	render(delta: number): void {
		// Update controls
		this.controls.update();

		if (this.renderAction) {
			// Call render action
			this.renderAction(delta);
		}

		// Render
		this.renderer.render(this.scene, this.camera);
	}

	destroy(): void {
		// Dispose the renderer
		this.renderer.dispose();
	}

	abstract update(delta: number): void
}