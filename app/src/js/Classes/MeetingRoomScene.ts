import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import ExperienceScene from './ExperienceScene';

export class MeetingRoomScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.init();
	}

	init() {
		const geometry = new BoxGeometry( 1, 2, 1 );
		const material = new MeshBasicMaterial( { color: 'red' } );
		const cube = new Mesh( geometry, material );
		cube.position.x = 5;
		cube.position.z = -5;
		this.scene.add( cube );
	}
}