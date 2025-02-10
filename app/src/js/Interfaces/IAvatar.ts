import { AnimationAction, AnimationMixer, Object3D, Scene } from 'three';
import { AvatarType } from '../Enums/AvatarType.ts';

export interface IAvatar {
    scene: Scene;
    avatarType: AvatarType;
    model: Object3D | null;
    mixer: AnimationMixer;
    animationsMap: Map<string, AnimationAction | null>;

    init(): void;
    load(): void;
    update(delta: number): void;
    destroy(): void;
}