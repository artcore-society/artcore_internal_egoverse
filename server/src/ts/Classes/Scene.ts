import { IScene } from '../Interfaces/IScene';
import { IPlayer } from '../Interfaces/IPlayer';
import { SceneKey } from '../Enums/SceneKey.ts';

export class Scene implements IScene {
    sceneKey: SceneKey;
    players: Map<string, IPlayer>;

    constructor(sceneKey: SceneKey) {
        this.sceneKey = sceneKey;
        this.players = new Map();
    }

    addPlayer(player: IPlayer): void {
        this.players.set(player.id, player);
    }

    removePlayer(playerId: string): void {
        this.players.delete(playerId);
    }

    getState(currentUserId: string): object {
        const currentPlayer = this.players.get(currentUserId);
        const visitors = Array.from(this.players.values()).filter(p => p.id !== currentUserId);

        return {
            sceneKey: this.sceneKey, // Only use sceneKey as the unique identifier
            currentPlayer,
            visitors: visitors.map(v => ({
                id: v.id,
                username: v.username,
                avatarId: v.avatarId,
                position: v.position.toArray(),
                rotation: [v.rotation.x, v.rotation.y, v.rotation.z]
            }))
        };
    }
}
