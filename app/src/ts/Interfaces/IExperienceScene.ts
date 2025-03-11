import { IDialog } from './IDialog.ts';
import { SceneKey } from '../Enums/SceneKey.ts';
import { CameraPov } from '../Enums/CameraPov.ts';
import { ISceneSettings } from './ISceneSettings.ts';
import { AnimationMixer, Object3D, Quaternion, Scene, Vector3 } from 'three';
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
	currentCameraPov: CameraPov;
	environment: Object3D;
	mixer: AnimationMixer | null;

	readonly currentPlayer: Player | undefined;

	addVisitor(
		userId: string,
		username: string,
		modelId: number,
		spawnPosition?: Vector3,
		spawnRotation?: Quaternion
	): void;
	removeVisitor(userId: string): void;
	addCurrentPlayer(username: string, modelId: number, spawnPosition: Vector3, spawnRotation: Quaternion): void;
	removeCurrentPlayer(): void;
	addNpc(username: string, modelId: number, dialog: IDialog, spawnPosition: Vector3, spawnRotation: Quaternion): void;
	setCameraPov(pov: CameraPov): void;
	update(delta: number): void;
	destroy(): void;
}
