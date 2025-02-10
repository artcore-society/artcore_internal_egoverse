import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import ExperienceScene from './ExperienceScene';

export class ChatRoomScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.init();
	}

	init() {
		const geometry = new BoxGeometry( 2, 1, 1 );
		const material = new MeshBasicMaterial( { color: 'blue' } );
		const cube = new Mesh( geometry, material );
		this.scene.add( cube );
	}
}