import { IPlayer } from './IPlayer';
import { ISceneState } from './ISceneState.ts';
import { ISceneSettings } from './ISceneSettings.ts';

export interface IScene {
    players: Map<string, IPlayer>;
    settings: ISceneSettings

    addPlayer(player: IPlayer): void;
    removePlayer(playerId: string): void;
    getState(currentUserId: string): ISceneState;
}
