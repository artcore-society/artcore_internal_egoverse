import { Vector3 } from 'three';
import { KeyboardKey } from '../Enums/KeyboardKey.ts';
import { SceneKey } from '../Enums/SceneKey.ts';

export interface ISocketClientUpdatePlayerData {
    delta: number;
    initialPosition: Vector3;
    keysPressed: { [key in KeyboardKey]: boolean };
    sceneKey: SceneKey;
    visitorId: string;
}