import ExperienceScene from './ExperienceScene';

export class LandingAreaScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.init();
	}

	async init() {
		// Setup floor
		await this.setupFloor(
			'/assets/textures/floor/wood_floor_diff_2k.jpg',
			'/assets/textures/floor/wood_floor_nor_gl_2k.exr',
			'/assets/textures/floor/wood_floor_rough_2k.exr',
			'/assets/textures/floor/wood_floor_disp_2k.png'
		);
	}
}