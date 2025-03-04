import { IPlayer } from './IPlayer.ts';
import { SceneKey } from '../Enums/SceneKey.ts';

export interface ISceneState {
    sceneKey: SceneKey;
    currentPlayer: IPlayer | undefined
    visitors: Array<{
        id: string,
        username: string,
        modelId: number,
        position: Array<number>,
        quaternion: Array<number>,
    }>
}