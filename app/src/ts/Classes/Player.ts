import { gsap } from 'gsap';
import { IPlayer } from '../Interfaces/IPlayer.ts';
import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { Vector3, Quaternion } from 'three';
import PlayerControls from './PlayerControls.ts';
import ExperienceCamera from './ExperienceCamera.ts';
import ExperienceScene from './ExperienceScene.ts';
import ExperienceManager from './ExperienceManager.ts';
import BaseCharacter from './BaseCharacter.ts';

export default class Player extends BaseCharacter implements IPlayer {
	public camera: ExperienceCamera;
	public isCurrent: boolean = false;
	public controls: PlayerControls | null = null;

	constructor(
		username: string,
		modelPrefix: ModelPrefix,
		modelId: number,
		experienceScene: ExperienceScene,
		camera: ExperienceCamera,
		isCurrent: boolean = false,
		spawnPosition: Vector3 = new Vector3(),
		spawnRotation: Quaternion = new Quaternion()
	) {
		super(username, modelPrefix, modelId, experienceScene, spawnPosition, spawnRotation);

		this.camera = camera;
		this.isCurrent = isCurrent;

		// Initiate
		this.init().then(() => {
			// Setup player controls
			this.controls = new PlayerControls(this);

			if (this.isCurrent) {
				// Make sure controls are connected
				this.controls.connect();
			}
		});
	}

	override update(delta: number): void {
		// Update the mixer
		this.mixer.update(delta);

		if (this.controls && ExperienceManager.instance.isInteractive) {
			// Update controls
			this.controls.update(delta, this.controls.keysPressed);
		}
	}

	override destroy() {
		if (this.controls) {
			// Disconnect player controls
			this.controls.disconnect();
		}

		if (this.model) {
			// Make sure all tweens are killed first
			gsap.killTweensOf(this.model.scale);

			// Animate in character
			gsap.to(this.model.scale, {
				x: 0,
				y: 0,
				z: 0,
				ease: 'back.out',
				duration: 1,
				onComplete: () => {
					if (this.model) {
						// Remove model from experienceScene
						this.experienceScene.scene.remove(this.model);
					}
				}
			});
		}
	}
}
