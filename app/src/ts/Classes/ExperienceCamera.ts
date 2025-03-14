import { PerspectiveCamera, Scene } from 'three';

export default class ExperienceCamera extends PerspectiveCamera {
	constructor(scene: Scene, canvas: HTMLCanvasElement) {
		super(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 2000);

		// Update camera projection matrix
		this.updateProjectionMatrix();

		// Add camera to scene
		scene.add(this);
	}
}
