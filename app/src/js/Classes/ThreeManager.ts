import { Clock } from 'three';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import { SceneKey } from '../Enums/SceneKey';
import ExperienceRenderer from './ExperienceRenderer.ts';
import ExperienceScene from './ExperienceScene.ts';

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
		this.renderer = new ExperienceRenderer(this.canvas);

		// Set scene size
		this.setSceneSize();

		// Add event listeners
		this.addEventListeners();

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

		// Set new active scene
		this.activeScene = this.scenes.get(key) || null;
	}

	private addEventListeners() {
		window.addEventListener('resize', () => this.resize());
	}

	private removeEventListeners() {
		window.removeEventListener('resize', () => this.resize());
	}

	private animate(): void {
		// Get delta time
		const delta = this.clock.getDelta();

		// Only update and render the active scene
		if (this.activeScene) {
			// Update the scene
			this.activeScene.update(delta);

			// Render the renderer
			this.renderer.render(this.activeScene.scene, this.activeScene.camera);
		}

		// Request new frame
		this.animateFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	private setSceneSize() {
		this.scenes.forEach((scene) => {
			// Update camera of all scenes
			scene.camera.aspect = window.innerWidth / window.innerHeight;
			scene.camera.updateProjectionMatrix();
		})

		// Set canvas size again
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	public resize(): void {
		// Set new scene size
		this.setSceneSize();
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

		// Remove event listeners
		this.removeEventListeners();

		// Dispose of the renderer
		this.renderer.dispose();
	}
}