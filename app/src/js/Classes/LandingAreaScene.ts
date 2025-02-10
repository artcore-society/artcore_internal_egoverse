import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import ExperienceScene from './ExperienceScene';

export class LandingAreaScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.init();
	}

	init() {
		// Set render action
		this.setRenderAction(() => {
			console.log('rendering LANDING AREA');
		});

		const geometry = new BoxGeometry( 1, 1, 1 );
		const material = new MeshBasicMaterial( { color: 'green' } );
		const cube = new Mesh( geometry, material );
		this.scene.add( cube );
	}
}