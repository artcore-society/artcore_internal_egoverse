import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { IExperienceScene } from './IExperienceScene.ts';
import { AnimationAction, AnimationMixer, Object3D, Quaternion, Vector3 } from 'three';

export interface IBaseCharacter {
	username: string;
	modelPrefix: ModelPrefix;
	modelId: number;
	experienceScene: IExperienceScene;
	model: Object3D | null;
	mixer: AnimationMixer | null;
	animationsMap: Map<string, AnimationAction>;
	spawnPosition: Vector3;
	spawnRotation: Quaternion;

	init(): Promise<void>;
	load(): Promise<void>;
	update(delta: number): void;
	destroy(): void;
}
