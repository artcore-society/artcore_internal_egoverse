import { Clock } from 'three';
import { SceneKey } from '../Enums/SceneKey';
import { IExperienceScene } from '../Interfaces/IExperienceScene';
import ExperienceRenderer from './ExperienceRenderer.ts';

export default class ThreeManager {
	private readonly canvas: HTMLCanvasElement;
	private readonly clock: Clock;
	private readonly renderer: ExperienceRenderer;
	private readonly scenes: Map<SceneKey, IExperienceScene>;
	private animateFrameId: number | null = null;
	private activeScene: IExperienceScene | null = null;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.clock = new Clock();
		this.scenes = new Map();
		this.renderer = new ExperienceRenderer(canvas);

		// Start animation loop
		this.animate();
	}

	addScene(key: SceneKey, scene: IExperienceScene): void {
		this.scenes.set(key, scene);
	}

	setActiveScene(key: SceneKey): void {
		// Check if the scene exists
		if (!this.scenes.has(key)) {
			console.warn(`Scene "${key}" not found.`);
			return;
		}

		// Deactivate previous scene (if any)
		if (this.activeScene) {
			this.activeScene.pause();
		}

		// Set new active scene
		this.activeScene = this.scenes.get(key) || null;

		// Activate new scene
		if (this.activeScene) {
			this.activeScene.resize();
			this.activeScene.resume();
		}
	}

	private animate(): void {
		// Get delta time
		const delta = this.clock.getDelta();

		// Only update and render the active scene
		if (this.activeScene) {
			this.activeScene.render(delta);
		}

		// Request new frame
		this.animateFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	destroy(): void {
		if (this.animateFrameId) {
			// Cancel next frame
			cancelAnimationFrame(this.animateFrameId);
		}

		// Destroy the active scene
		if (this.activeScene) {
			this.activeScene.destroy();
		}

		// Destroy all scenes in the map
		this.scenes.forEach((scene) => {
			scene.destroy();
		});

		// Dispose of the renderer
		this.renderer.dispose();
	}
}