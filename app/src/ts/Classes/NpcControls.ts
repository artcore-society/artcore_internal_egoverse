import Npc from './Npc.ts';
import BaseCharacterControls from './BaseCharacterControls.ts';

export default class NpcControls extends BaseCharacterControls {
	constructor(npc: Npc) {
		super(npc);
	}
}
