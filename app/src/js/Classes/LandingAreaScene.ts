import ExperienceScene from './ExperienceScene';
import Avatar from './Avatar.ts';
import { AmbientLight } from 'three';

export class LandingAreaScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.init();
	}

	init() {
		// Set render action
		this.setUpdateAction(() => {
			console.log('rendering LANDING AREA');
		});

		// Setup landing area lighting
		this.setupLighting();


		const player = new Avatar(this.scene);
	}

	setupLighting() {
		const light = new AmbientLight( 0x404040 );
		this.scene.add( light );
	}
}