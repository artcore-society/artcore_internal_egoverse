import { IPlayer } from '../Interfaces/IPlayer.ts';
import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { Vector3, Quaternion } from 'three';
import ExperienceCamera from './ExperienceCamera.ts';
import ExperienceScene from './ExperienceScene.ts';
import BaseCharacter from './BaseCharacter.ts';
import PlayerControls from './PlayerControls.ts';

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
	}
}
