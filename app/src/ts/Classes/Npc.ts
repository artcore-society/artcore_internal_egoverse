import { INpc } from '../Interfaces/INpc.ts';
import { IDialog } from '../Interfaces/IDialog.ts';
import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { AnimationName } from '../Enums/AnimationName.ts';
import { Quaternion, Vector3 } from 'three';
import ExperienceScene from './ExperienceScene.ts';
import BaseCharacter from './BaseCharacter.ts';
import ExperienceCamera from './ExperienceCamera.ts';
import NpcControls from './NpcControls.ts';

export default class Npc extends BaseCharacter implements INpc {
	public dialog: IDialog;
	constructor(
		username: string,
		modelPrefix: ModelPrefix,
		modelId: number,
		dialog: IDialog,
		experienceScene: ExperienceScene,
		camera: ExperienceCamera,
		spawnPosition: Vector3 = new Vector3(),
		spawnRotation: Quaternion = new Quaternion()
	) {
		super(username, modelPrefix, modelId, camera, experienceScene, spawnPosition, spawnRotation);

		this.dialog = dialog;

		// Initiate
		this.init().then(() => {
			// Setup controls after npc is fully initiated
			this.controls = new NpcControls(this);
		});
	}

	public startDialog(): void {
		if (this.controls) {
			// Start playing talking animation
			this.controls.playAnimation(AnimationName.TALKING);
		}
	}
}
