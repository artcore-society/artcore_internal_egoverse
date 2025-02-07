import { WebGLRenderer } from 'three';

export default class ExperienceRenderer extends WebGLRenderer {
	constructor(canvas: HTMLCanvasElement) {
		super({
			canvas: canvas,
			antialias: true,
			alpha: true
		});
	}
}