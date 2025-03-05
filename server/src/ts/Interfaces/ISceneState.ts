import { SceneKey } from '../Enums/SceneKey.ts';
import { IBaseCharacter } from './IBaseCharacter.ts';

export interface ISceneState {
    sceneKey: SceneKey;
    currentPlayer: IBaseCharacter | undefined;
    npcs: Array<{
        username: string,
        modelId: number,
        position: Array<number>,
        quaternion: Array<number>,
    }>;
    visitors: Array<{
        id: string,
        username: string,
        modelId: number,
        position: Array<number>,
        quaternion: Array<number>,
    }>;
}