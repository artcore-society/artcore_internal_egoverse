import { SceneKey } from '../Enums/SceneKey.ts';
import { KeyboardKey } from '../Enums/KeyboardKey.ts';

export interface ISocketClientUpdatePlayerData {
	delta: number;
	keysPressed: { [key in KeyboardKey]: boolean };
	sceneKey: SceneKey;
	visitorId: string;
}
