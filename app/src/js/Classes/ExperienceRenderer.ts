import { PCFSoftShadowMap, WebGLRenderer } from 'three';

export default class ExperienceRenderer extends WebGLRenderer {
	constructor(canvas: HTMLCanvasElement) {
		super({
			powerPreference: 'high-performance',
			canvas: canvas,
			antialias: true,
			alpha: true
		});

		// Enable shadow map
		this.shadowMap.enabled = true;
		this.shadowMap.type = PCFSoftShadowMap;

		// Set renderer size
		this.setSize(window.innerWidth, window.innerHeight);
	}
}