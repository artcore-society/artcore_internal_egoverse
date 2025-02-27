import { SceneKey } from '../Enums/SceneKey.ts';
import { KeyboardKey } from '../Enums/KeyboardKey.ts';
import { Euler, Vector3 } from 'three';

export interface ISocketClientUpdatePlayerData {
	delta: number;
	keysPressed: { [key in KeyboardKey]: boolean };
	sceneKey: SceneKey;
	visitorId: string;
}
