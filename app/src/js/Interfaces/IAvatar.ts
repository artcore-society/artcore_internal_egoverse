import { AvatarType } from '../Enums/AvatarType.ts';
import { IExperienceScene } from './IExperienceScene.ts';
import { AnimationAction, AnimationMixer, Object3D } from 'three';
import AvatarControls from '../Classes/AvatarControls.ts';

export interface IAvatar {
    experienceScene: IExperienceScene;
    ready: boolean;
    type: AvatarType;
    controls: AvatarControls | null;
    model: Object3D | null;
    mixer: AnimationMixer;
    animationsMap: Map<string, AnimationAction | null>;

    init(): void;
    load(): void;
    update(delta: number): void;
    destroy(): void;
}