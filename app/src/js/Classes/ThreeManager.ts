import { Clock } from 'three';
import { SceneKey } from '../Enums/SceneKey.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';

export default class ThreeManager {
	private readonly canvas: HTMLCanvasElement;
	private readonly clock: Clock;
	private readonly scenes: Map<SceneKey, IExperienceScene>;
	private animateFrameId: number | null = null;

	constructor(canvasId: string) {
		// Get the canvas element
		const element = document.getElementById(canvasId);
		if (!element || !(element instanceof HTMLCanvasElement)) {
			throw new Error('Invalid element. Must be a canvas!');
		}

		this.canvas = element;
		this.clock = new Clock();
		this.scenes = new Map();

		// Start animation loop
		this.animate();
	}

	addScene(key: SceneKey, scene: IExperienceScene): void {
		this.scenes.set(key, scene);
	}

	setActiveScene(key: SceneKey): void {
		if (!this.scenes.has(key)) {
			console.warn(`Scene "${key}" not found.`);
			return;
		}
	}

	getScenes(): Map<SceneKey, IExperienceScene> {
		return this.scenes;
	}

	private animate(): void {
		// Get delta time
		const delta = this.clock.getDelta();

		// Update and render all scenes
		this.scenes.forEach((scene) => {
			scene.update(delta);
			scene.render(delta);
		});

		// Request new frame
		this.animateFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	destroy(): void {
		if (this.animateFrameId) {
			// Cancel next frame
			cancelAnimationFrame(this.animateFrameId);
		}

		this.scenes.forEach((scene) => {
			// Destroy all scenes
			scene.destroy()
		});
	}
}