import { SceneKey } from '../Enums/SceneKey.ts';
import { ISceneSettings } from './ISceneSettings.ts';
import { Object3D, Quaternion, Scene, Vector3 } from 'three';
import ExperienceCamera from '../Classes/ExperienceCamera.ts';
import Player from '../Classes/Player.ts';

export interface IExperienceScene {
	scene: Scene;
	sceneKey: SceneKey;
	settings: ISceneSettings;
	camera: ExperienceCamera;
	cameraParent: Object3D;
	updateAction: ((delta: number) => void) | null;
	players: { [key: string]: Player };

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
	update(delta: number): void;
	destroy(): void;
}
