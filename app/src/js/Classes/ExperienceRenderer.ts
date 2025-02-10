import { ACESFilmicToneMapping, PCFSoftShadowMap, WebGLRenderer } from 'three';

export default class ExperienceRenderer extends WebGLRenderer {
	constructor(canvas: HTMLCanvasElement) {
		super({
			canvas: canvas,
			antialias: true,
			alpha: true
		});

		// Enable shadow map
		this.shadowMap.enabled = true;
		this.shadowMap.type = PCFSoftShadowMap;

		// Set tone mapping
		this.toneMapping = ACESFilmicToneMapping;

		// Set renderer size
		this.setSize(window.innerWidth, window.innerHeight);
	}
}