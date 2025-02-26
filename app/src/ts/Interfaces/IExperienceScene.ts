import { SceneKey } from '../Enums/SceneKey.ts';
import { Object3D, Quaternion, Scene, Vector3 } from 'three';
import ExperienceCamera from '../Classes/ExperienceCamera.ts';
import Avatar from '../Classes/Avatar.ts';

export interface IExperienceScene {
    scene: Scene;
    sceneKey: SceneKey,
    camera: ExperienceCamera;
    cameraParent: Object3D;
    updateAction: ((delta: number) => void) | null;
    currentPlayerAvatar: Avatar | null;
    visitorAvatars: { [key: string]: Avatar };

    setupFloor(color: number): void;
    addVisitor(userId: string, username: string, selectedAvatarId: number, spawnPosition?: Vector3, spawnRotation?: Quaternion): void;
    removeVisitor(userId: string): void;
    addCurrentPlayer(username: string, selectedAvatarId: number): void;
    removeCurrentPlayer(): void;
    update(delta: number): void;
    destroy(): void;
}