import Player from './Player.ts';
import BaseCharacterControls from './BaseCharacterControls.ts';

export default class PlayerControls extends BaseCharacterControls {
	constructor(player: Player) {
		super(player);

		if (player.isCurrent) {
			// Make sure camera parent position is starts at spawn position
			player.experienceScene.cameraParent.position.set(
				player.spawnPosition.x,
				player.spawnPosition.y,
				player.spawnPosition.z
			);
		}
	}
}
