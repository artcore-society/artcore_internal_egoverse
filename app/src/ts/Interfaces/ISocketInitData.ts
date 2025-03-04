import { SceneKey } from '../Enums/SceneKey.ts';
import { ISceneSettings } from './ISceneSettings.ts';

export interface ISocketInitData {
	id: string;
	currentSceneKey: string;
	scenes: Array<{
		sceneKey: SceneKey;
		settings: ISceneSettings;
	}>;
}
