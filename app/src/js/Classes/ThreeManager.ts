import { Clock, DefaultLoadingManager, LoadingManager } from 'three';
import { SceneKey } from '../Enums/SceneKey';
import { IThreeScene } from '../Interfaces/IThreeScene.ts';
import ExperienceRenderer from './ExperienceRenderer.ts';
import { EventService } from '../Services/EventService.ts';
import { CustomEventKey } from '../Enums/CustomEventKey.ts';

export default class ThreeManager {
	private readonly canvas: HTMLCanvasElement;
	private readonly clock: Clock;
	private readonly renderer: ExperienceRenderer;
	private readonly scenes: Map<SceneKey, IThreeScene>;
	private animateFrameId: number | null = null;
	private activeScene: IThreeScene | null = null;
	private loaderManager: LoadingManager;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.clock = new Clock();
		this.scenes = new Map();
		this.renderer = new ExperienceRenderer(this.canvas);
		this.loaderManager = DefaultLoadingManager;

		// Set scene size
		this.setSceneSize();

		// Add event listeners
		this.addEventListeners();

		// Handle scene loading
		this.handleSceneLoading();
	}

	addScene(key: SceneKey, scene: IThreeScene): void {
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

	private handleSceneLoading() {
		// On load
		this.loaderManager.onLoad = () => {
			// Start animation loop
			this.animate();

			// Dispatch is ready event
			EventService.dispatch(CustomEventKey.READY);
		};
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