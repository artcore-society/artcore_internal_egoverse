import { Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IScene } from '../Interfaces/IScene.ts';
import { IAvatarLobby } from '../Interfaces/IAvatarLobby.ts';
import ExperienceCamera from './ExperienceCamera.ts';
import Avatar from './Avatar.ts';

export default abstract class ExperienceScene implements IScene, IAvatarLobby {
	public readonly scene: Scene;
	public readonly camera: ExperienceCamera;
	public readonly controls: OrbitControls;
	public updateAction: ((delta: number) => void) | null;
	public currentPlayer: Avatar | null = null;
	public visitors: Avatar[] | null = null;

	protected constructor(canvas: HTMLCanvasElement) {
		this.scene = new Scene();
		this.camera = new ExperienceCamera(this.scene, canvas);
		this.controls = new OrbitControls(this.camera, canvas);
		this.updateAction = null;

		// Set scene size
		this.setSceneSize();
	}

	abstract init(): void

	setUpdateAction(callback: (delta: number) => void): void {
		this.updateAction = callback;
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

	update(delta: number): void {
		// Update controls
		this.controls.update();

		if (this.updateAction) {
			// Call render action if not paused
			this.updateAction(delta);
		}
	}

	destroy(): void {
		// Dispose any resources tied to the scene
	}
}