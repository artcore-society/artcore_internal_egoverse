import { SceneKey } from '../Enums/SceneKey.ts';
import ExperienceScene from './ExperienceScene';

export class ChatRoomScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement, sceneKey: SceneKey) {
		super(canvas, sceneKey);

		this.init();
	}

	init() {
		// Setup floor
		this.setupFloor('blue');
	}
}