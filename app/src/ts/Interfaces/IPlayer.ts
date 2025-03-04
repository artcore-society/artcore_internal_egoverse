import { IExperienceScene } from './IExperienceScene.ts';
import { AnimationAction, AnimationMixer, Object3D, Quaternion, Vector3 } from 'three';
import PlayerControls from '../Classes/PlayerControls.ts';

export interface IPlayer {
	username: string;
	modelId: number;
	experienceScene: IExperienceScene;
	isCurrent: boolean;
	controls: PlayerControls | null;
	model: Object3D | null;
	mixer: AnimationMixer;
	animationsMap: Map<string, AnimationAction | null>;
	spawnPosition: Vector3;
	spawnRotation: Quaternion;

	init(): void;
	load(): void;
	update(delta: number): void;
	destroy(): void;
}
