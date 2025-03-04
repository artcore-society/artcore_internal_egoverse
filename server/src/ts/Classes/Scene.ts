import { IScene } from '../Interfaces/IScene';
import { IPlayer } from '../Interfaces/IPlayer';
import { SceneKey } from '../Enums/SceneKey.ts';
import { ISceneState } from '../Interfaces/ISceneState.ts';
import { ISceneSettings } from '../Interfaces/ISceneSettings.ts';

export class Scene implements IScene {
    sceneKey: SceneKey;
    players: Map<string, IPlayer>;
    settings: ISceneSettings;

    constructor(sceneKey: SceneKey, settings: ISceneSettings = { color: 'Blue' }) {
        this.sceneKey = sceneKey;
        this.settings = settings;
        this.players = new Map();
    }

    addPlayer(player: IPlayer): void {
        this.players.set(player.id, player);
    }

    removePlayer(playerId: string): void {
        this.players.delete(playerId);
    }

    getState(currentUserId: string): ISceneState {
        const currentPlayer = this.players.get(currentUserId);
        const visitors = Array.from(this.players.values()).filter(p => p.id !== currentUserId);

        return {
            sceneKey: this.sceneKey,
            currentPlayer,
            visitors: visitors.map(v => ({
                id: v.id,
                username: v.username,
                modelId: parseInt(v.modelId),
                position: v.position.toArray(),
                quaternion: [v.quaternion.x, v.quaternion.y, v.quaternion.z, v.quaternion.w]
            }))
        };
    }
}
