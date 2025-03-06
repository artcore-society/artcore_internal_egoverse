import { IDialog } from './IDialog.ts';
import { SceneKey } from '../Enums/SceneKey.ts';
import { ISceneSettings } from './ISceneSettings.ts';
import { Object3D, Quaternion, Scene, Vector3 } from 'three';
import ExperienceCamera from '../Classes/ExperienceCamera.ts';
import Player from '../Classes/Player.ts';
import Npc from '../Classes/Npc.ts';

export interface IExperienceScene {
	scene: Scene;
	sceneKey: SceneKey;
	settings: ISceneSettings;
	camera: ExperienceCamera;
	cameraParent: Object3D;
	updateAction: ((delta: number) => void) | null;
	players: { [key: string]: Player };
	npcs: Array<Npc>;

	readonly currentPlayer: Player | undefined;

	setupFloor(color: number): void;
	addVisitor(
		userId: string,
		username: string,
		modelId: number,
		spawnPosition?: Vector3,
		spawnRotation?: Quaternion
	): void;
	removeVisitor(userId: string): void;
	addCurrentPlayer(username: string, modelId: number): void;
	removeCurrentPlayer(): void;
	addNpc(username: string, modelId: number, dialog: IDialog, spawnPosition: Vector3, spawnRotation: Quaternion): void;
	update(delta: number): void;
	destroy(): void;
}
