import { Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IExperienceScene } from '../Interfaces/IExperienceScene';
import ExperienceCamera from './ExperienceCamera.ts';

export default abstract class ExperienceScene implements IExperienceScene {
	public readonly scene: Scene;
	public readonly camera: ExperienceCamera;
	public readonly controls: OrbitControls;
	public renderAction: ((delta: number) => void) | null;
	private isPaused: boolean = false;

	protected constructor(canvas: HTMLCanvasElement) {
		this.scene = new Scene();
		this.camera = new ExperienceCamera(this.scene, canvas);
		this.controls = new OrbitControls(this.camera, canvas);
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
	}

	resize(): void {
		// Set new scene size
		this.setSceneSize();
	}

	render(delta: number): void {
		if (this.isPaused) {
			return;
		}

		// Update controls
		this.controls.update();

		if (this.renderAction && !this.isPaused) {
			// Call render action if not paused
			this.renderAction(delta);
		}
	}

	destroy(): void {
		// Dispose any resources tied to the scene
	}

	pause(): void {
		this.isPaused = true;
	}

	resume(): void {
		this.isPaused = false;
	}
}