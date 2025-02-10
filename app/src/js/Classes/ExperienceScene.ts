import { IScene } from '../Interfaces/IScene.ts';
import { AvatarType } from '../Enums/AvatarType.ts';
import { IAvatarLobby } from '../Interfaces/IAvatarLobby.ts';
import { AmbientLight, DirectionalLight, HemisphereLight, OrthographicCamera, Scene } from 'three';
import ExperienceCamera from './ExperienceCamera.ts';
import Avatar from './Avatar.ts';

export default abstract class ExperienceScene implements IScene, IAvatarLobby {
	public readonly scene: Scene;
	public readonly camera: ExperienceCamera;
	public updateAction: ((delta: number) => void) | null;
	public currentPlayer: Avatar | null = null;
	public visitors: Avatar[] | null = null;

	protected constructor(canvas: HTMLCanvasElement) {
		this.scene = new Scene();
		this.camera = new ExperienceCamera(this.scene, canvas);
		this.updateAction = null;

		// Set scene size
		this.setSceneSize();

		// Set current player
		this.currentPlayer = new Avatar(this.scene, this.camera, AvatarType.CURRENT_PLAYER);

		// Set render action
		this.setUpdateAction((delta) => {
			if(this.currentPlayer) {
				// Update avatar
				this.currentPlayer.update(delta);
			}
		});

		// Setup lighting
		this.setupLighting();
	}

	setupLighting(): void {
		// Add ambient light
		const ambientLight = new AmbientLight(0xffffff, 5);
		this.scene.add(ambientLight);

		// Add hemisphere light
		const hemiLight = new HemisphereLight(0xffffff, 0x444444, 0.5);
		hemiLight.position.set(0, 20, 0);
		this.scene.add(hemiLight);

		// Add directional light
		const dirLight = new DirectionalLight(0xffffff, 10);
		dirLight.position.set(-3, 10, -10);
		dirLight.castShadow = true;
		dirLight.shadow.camera = new OrthographicCamera(-10, 10, 10, -10, 1, 1000);
		dirLight.shadow.mapSize.set(4096, 4096);
		this.scene.add(dirLight);
	}

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
		if (this.updateAction) {
			// Call render action if not paused
			this.updateAction(delta);
		}
	}

	destroy(): void {
		// Dispose any resources tied to the scene
	}
}