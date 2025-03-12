import { IPlayer } from '../Interfaces/IPlayer.ts';
import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { Vector3, Quaternion } from 'three';
import ExperienceCamera from './ExperienceCamera.ts';
import ExperienceScene from './ExperienceScene.ts';
import BaseCharacter from './BaseCharacter.ts';
import PlayerControls from './PlayerControls.ts';
import ParticleSystem from './ParticleSystem.ts';

export default class Player extends BaseCharacter implements IPlayer {
	public isCurrent: boolean = false;

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
		super(username, modelPrefix, modelId, camera, experienceScene, spawnPosition, spawnRotation);

		this.isCurrent = isCurrent;

		// Initiate
		this.init().then(() => {
			// Setup controls after player is fully initiated
			this.controls = new PlayerControls(this);

			if (this.isCurrent) {
				// Make sure controls are connected
				this.controls.connect();
			}
		});

		// Setup fart particle effect
		const fartEffect = new ParticleSystem({
			camera,
			// Assuming the bum is located slightly behind the player model, with a slight offset on the y-axis.
			emitPosition: this.model.position,
			parent: this.experienceScene.scene,
			rate: 25,
			texture: '/assets/textures/fire/particle.png'
		});

		// Set render action
		this.setRenderAction((delta) => {
			if (!this.model) {
				return;
			}

			// Get the particles emit position
			const particlesEmitPosition = this.getParticlesEmitPosition();

			// Update the emit position of the effect
			fartEffect.params.emitPosition.copy(particlesEmitPosition);

			// Update the fart effect
			fartEffect.update(delta);
		});
	}

	private getParticlesEmitPosition(): Vector3 {
		// Get the position of the character's model
		const position = this.model.position.clone();

		// Create an offset relative to the character's local space (behind the character)
		const offset = new Vector3(0, 0.5, 0.35); // Offset behind the character

		// Apply the quaternion to the offset to rotate it based on the character's orientation
		offset.applyQuaternion(this.model.quaternion);

		// Update the final emit position by adding the rotated offset to the character's position
		return position.add(offset);
	}
}
