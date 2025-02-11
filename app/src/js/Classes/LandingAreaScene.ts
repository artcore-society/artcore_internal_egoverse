import ExperienceScene from './ExperienceScene';

export class LandingAreaScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.init();
	}

	init() {
		// Setup floor
		this.setupFloor('green');
	}
}