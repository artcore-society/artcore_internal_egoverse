import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { Vector3, Quaternion } from 'three';
import ExperienceScene from './ExperienceScene.ts';
import BaseCharacter from './BaseCharacter.ts';
import ExperienceCamera from './ExperienceCamera.ts';
import NpcControls from './NpcControls.ts';

export default class Npc extends BaseCharacter {
	constructor(
		username: string,
		modelPrefix: ModelPrefix,
		modelId: number,
		experienceScene: ExperienceScene,
		camera: ExperienceCamera,
		spawnPosition: Vector3 = new Vector3(),
		spawnRotation: Quaternion = new Quaternion()
	) {
		super(username, modelPrefix, modelId, camera, experienceScene, spawnPosition, spawnRotation);

		// Initiate
		this.init().then(() => {
			// Setup controls after npc is fully initiated
			this.controls = new NpcControls(this);
		});
	}
}
