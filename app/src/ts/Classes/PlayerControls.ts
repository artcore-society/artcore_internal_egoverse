import Player from './Player.ts';
import BaseCharacterControls from './BaseCharacterControls.ts';

export default class PlayerControls extends BaseCharacterControls {
	constructor(player: Player) {
		super(player);
	}
}
