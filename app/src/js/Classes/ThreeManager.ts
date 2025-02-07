import { ref, Ref } from 'vue';
import { Clock, DefaultLoadingManager, LoadingManager, Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import ExperienceRenderer from './ExperienceRenderer.ts';
import ExperienceCamera from './ExperienceCamera.ts';

export default class ThreeManager {
	protected readonly scene: Scene;
	protected readonly canvas: HTMLCanvasElement;
	protected readonly camera: ExperienceCamera;
	protected readonly renderer: ExperienceRenderer;
	protected readonly controls: OrbitControls;
	protected readonly clock: Clock;
	protected readonly dracoLoader: DRACOLoader;
	protected readonly gltfLoader: GLTFLoader;
	protected readonly loaderManager: LoadingManager;
	protected isSceneReady: Ref;
	protected renderAction: ((delta: number) => void) | null;
	protected animateFrameId: number | null;

	constructor(canvasId: string) {
		// Get canvas
		const element = document.getElementById(canvasId);

		// Check element type
		if(!element || !(element instanceof HTMLCanvasElement)) {
			throw new Error('Invalid element. Must be a canvas!');
		}

		this.scene = new Scene();
		this.canvas = element;
		this.camera = new ExperienceCamera(this.scene, this.canvas);
		this.renderer = new ExperienceRenderer(this.canvas);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.renderAction = null;
		this.isSceneReady = ref(false);
		this.clock = new Clock();
		this.gltfLoader = new GLTFLoader();
		this.dracoLoader = new DRACOLoader();
		this.gltfLoader.setDRACOLoader(this.dracoLoader);
		this.animateFrameId = null;
		this.loaderManager = DefaultLoadingManager;

		// Init
		this.init();
	}

	init() {
		// Set scene size
		this.setSceneSize();

		// Handle scene loading
		this.handleSceneLoading();
	}

	setSceneSize(): void {
		// Set correct aspect
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		// Set canvas size again
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	handleSceneLoading(): void {
		// On load
		this.loaderManager.onLoad = () => {
			// Set ready state
			this.isSceneReady.value = true;
		};
	}

	animate(): void {
		// Render the frame
		this.render();

		// Request a new frame
		this.animateFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	setRenderAction(callback: () => void): void {
		if (callback) {
			// Set render action
			this.renderAction = callback;
		}
	}

	render(): void {
		// Get delta
		const delta = this.clock.getDelta();

		if (this.controls) {
			// Update controls
			this.controls.update();
		}

		if (this.renderAction) {
			// Call render action
			this.renderAction(delta);
		}

		// Render
		this.renderer.render(this.scene, this.camera);
	}

	destroy(): void {
		// Cancel the animation frame
		if (this.animateFrameId) {
			cancelAnimationFrame(this.animateFrameId);
		}

		// Dispose of renderer
		if (this.renderer) {
			this.renderer.dispose();
		}
	}

	resize(): void {
		// Set new scene size
		this.setSceneSize();
	}
}
