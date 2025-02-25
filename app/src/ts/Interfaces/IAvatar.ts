import { AvatarType } from '../Enums/AvatarType.ts';
import { IExperienceScene } from './IExperienceScene.ts';
import { AnimationAction, AnimationMixer, Object3D, Quaternion, Vector3 } from 'three';
import AvatarControls from '../Classes/AvatarControls.ts';

export interface IAvatar {
    selectedAvatarId: string;
    experienceScene: IExperienceScene;
    type: AvatarType;
    controls: AvatarControls | null;
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