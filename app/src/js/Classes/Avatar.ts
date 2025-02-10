import { IAvatar } from '../Interfaces/IAvatar.ts';
import { ThreeLoaders } from './ThreeLoaders.ts';
import { AnimationAction, AnimationClip, AnimationMixer, Mesh, Object3D, Scene } from 'three';

export default class Avatar extends Mesh implements IAvatar {
	public scene: Scene;
	public model: Object3D | null = null;
	public mixer: AnimationMixer = new AnimationMixer(new Mesh()); // Will be overwritten with actual mixer
	public animationsMap: Map<string, AnimationAction> = new Map();

	constructor(scene: Scene) {
		super();

		this.scene = scene;

		// Initiate avatar
		this.init();
	}

	async init() {
		// Load model
		await this.load();
	}

	async load() {
		try {
			const gltf = await ThreeLoaders.loadGLTF('/assets/models/avatar/avatar.gltf');

			// Set class model
			this.model = gltf.scene;

			// Filter out the T pose animation
			const filteredAnimations = [...gltf.animations.filter((animation: AnimationClip) => animation.name !== 'TPose')];

			// Set animation mixer
			this.mixer = new AnimationMixer(this.model);

			// Set animations map
			filteredAnimations.forEach((animation: AnimationClip) => {
				this.animationsMap.set(animation.name, this.mixer.clipAction(animation));
			});
		} catch (error) {
			throw new Error(error);
		}

		// Add avatar to scene
		this.scene.add(this.model);
	}
}