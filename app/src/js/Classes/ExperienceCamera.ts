import { PerspectiveCamera, Scene } from 'three';

export default class ExperienceCamera extends PerspectiveCamera {
	constructor(scene: Scene, canvas: HTMLCanvasElement) {
		super(25, canvas.offsetWidth / canvas.offsetHeight, 0.1, 2000);

		// Set camera position
		this.position.set(0, 1, -10);

		// Update camera projection matrix
		this.updateProjectionMatrix();

		// Add camera to scene
		scene.add(this);
	}
}