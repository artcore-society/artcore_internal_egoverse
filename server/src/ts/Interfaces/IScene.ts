import { IPlayer } from './IPlayer';

export interface IScene {
    players: Map<string, IPlayer>;

    addPlayer(player: IPlayer): void;
    removePlayer(playerId: string): void;
    getState(currentUserId: string): object;
}
