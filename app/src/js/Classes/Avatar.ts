import { IAvatar } from '../Interfaces/IAvatar.ts';
import { AvatarType } from '../Enums/AvatarType.ts';
import { ThreeLoaders } from './ThreeLoaders.ts';
import { AnimationName } from '../Enums/AnimationName.ts';
import { AnimationAction, AnimationClip, AnimationMixer, Mesh, Object3D, Scene } from 'three';
import AvatarControls from './AvatarControls.ts';
import ExperienceCamera from './ExperienceCamera.ts';

export default class Avatar extends Mesh implements IAvatar {
	public scene: Scene;
	public camera: ExperienceCamera;
	public readonly avatarType: AvatarType = AvatarType.VISITOR
	private controls: AvatarControls | null = null;
	public model: Object3D | null = null;
	public mixer: AnimationMixer = new AnimationMixer(new Mesh()); // Will be overwritten with actual mixer
	public animationsMap: Map<AnimationName, AnimationAction> = new Map();

	constructor(scene: Scene, camera: ExperienceCamera, type: AvatarType = AvatarType.VISITOR) {
		super();

		this.scene = scene;
		this.camera = camera;
		this.avatarType = type;

		// Initiate avatar
		this.init();
	}

	async init() {
		// Load model
		await this.load();

		// Setup avatar controls
		this.controls = new AvatarControls(this);

		// Make sure controls are connected
		this.controls.connect();
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
				this.animationsMap.set(animation.name as AnimationName, this.mixer.clipAction(animation));
			});
		} catch (error) {
			console.error(error);
			throw new Error('Something went wrong loading the avatar model');
		}

		// Add avatar to scene
		this.scene.add(this.model);
	}

	update(delta: number): void {
		if(this.controls) {
			// Update controls
			this.controls.update(delta, this.controls.keysPressed);
		}

		// Update the mixer
		this.mixer.update(delta);
	}

	destroy() {
		if(!this.model) {
			return;
		}

		if(this.controls) {
			// Disconnect avatar controls
			this.controls.disconnect();
		}

		// Remove model from scene
		this.scene.remove(this.model);
	}
}