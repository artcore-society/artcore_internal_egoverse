import ExperienceScene from './ExperienceScene';

export class MeetingRoomScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.init();
	}

	async init() {
		// Setup floor
		 await this.setupFloor(
			'/assets/textures/deck/wood_floor_deck_diff_2k.jpg',
			'/assets/textures/deck/wood_floor_deck_nor_gl_2k.exr',
			'/assets/textures/deck/wood_floor_deck_rough_2k.exr',
			'/assets/textures/deck/wood_floor_deck_disp_2k.png'
		);
	}
}