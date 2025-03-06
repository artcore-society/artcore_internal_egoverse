import { Npc } from './Npc.ts';
import { Player } from './Player.ts';
import { IScene } from '../Interfaces/IScene';
import { SceneKey } from '../Enums/SceneKey.ts';
import { ISceneState } from '../Interfaces/ISceneState.ts';
import { ISceneSettings } from '../Interfaces/ISceneSettings.ts';

export class Scene implements IScene {
	sceneKey: SceneKey;
	players: Map<string, Player>;
	npcs: Array<Npc>;
	settings: ISceneSettings;

	constructor(sceneKey: SceneKey, npcs: Array<Npc> = [], settings: ISceneSettings = { color: 'Blue' }) {
		this.sceneKey = sceneKey;
		this.npcs = npcs;
		this.settings = settings;
		this.players = new Map();
	}

	addPlayer(player: Player): void {
		this.players.set(player.id, player);
	}

	removePlayer(playerId: string): void {
		this.players.delete(playerId);
	}

	getState(currentUserId: string): ISceneState {
		const currentPlayer = this.players.get(currentUserId);
		const visitors = Array.from(this.players.values()).filter((p) => p.id !== currentUserId);

		return {
			sceneKey: this.sceneKey,
			currentPlayer,
			npcs: this.npcs.map((npc) => ({
				username: npc.username,
				modelId: npc.modelId,
				position: npc.position.toArray(),
				quaternion: [npc.quaternion.x, npc.quaternion.y, npc.quaternion.z, npc.quaternion.w]
			})),
			visitors: visitors.map((v) => ({
				id: v.id,
				username: v.username,
				modelId: v.modelId,
				position: v.position.toArray(),
				quaternion: [v.quaternion.x, v.quaternion.y, v.quaternion.z, v.quaternion.w]
			}))
		};
	}
}
