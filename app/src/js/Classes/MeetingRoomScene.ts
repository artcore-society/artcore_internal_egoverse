import ExperienceScene from './ExperienceScene';

export class MeetingRoomScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.init();
	}

	init() {
		// Setup floor
		this.setupFloor('red');
	}
}