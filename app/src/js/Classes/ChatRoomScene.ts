import ExperienceScene from './ExperienceScene';

export class ChatRoomScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.init();
	}

	init() {
		// Setup floor
		this.setupFloor('blue');
	}
}