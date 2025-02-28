import { WebGLRenderer } from 'three';

export default class ExperienceRenderer extends WebGLRenderer {
	constructor(canvas: HTMLCanvasElement) {
		super({
			powerPreference: 'high-performance',
			canvas: canvas,
			antialias: true,
			alpha: true
		});

		// Set pixel ratio
		this.setPixelRatio(window.devicePixelRatio);

		// Set renderer size
		this.setSize(window.innerWidth, window.innerHeight);
	}
}
