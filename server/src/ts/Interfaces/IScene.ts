import { Npc } from '../Classes/Npc.ts';
import { Player } from '../Classes/Player.ts';
import { ISceneState } from './ISceneState.ts';
import { ISceneSettings } from './ISceneSettings.ts';

export interface IScene {
    players: Map<string, Player>;
    npcs: Array<Npc>;
    settings: ISceneSettings

    addPlayer(player: Player): void;
    removePlayer(playerId: string): void;
    getState(currentUserId: string): ISceneState;
}
