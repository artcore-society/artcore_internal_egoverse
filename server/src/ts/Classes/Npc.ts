import { INpc } from '../Interfaces/INpc.ts';
import { IDialog } from '../Interfaces/IDialog.ts';
import { BaseCharacter } from './BaseCharacter.ts';
import { Quaternion, Vector3 } from 'three';

export class Npc extends BaseCharacter implements INpc {
	public dialog: IDialog;

	constructor(
		username: string,
		modelId: number,
		dialog: IDialog,
		spawnPosition: Vector3 = new Vector3(),
		spawnRotation: Quaternion = new Quaternion()
	) {
		super(username, modelId, spawnPosition, spawnRotation);

		this.dialog = dialog;
	}
}
