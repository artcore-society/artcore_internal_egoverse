import { IAvatar } from '../Interfaces/IAvatar.ts';
import { AvatarType } from '../Enums/AvatarType.ts';
import { ThreeLoaders } from './ThreeLoaders.ts';
import { AnimationName } from '../Enums/AnimationName.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import { AnimationAction, AnimationClip, AnimationMixer, Mesh, Object3D } from 'three';
import AvatarControls from './AvatarControls.ts';
import ExperienceCamera from './ExperienceCamera.ts';

export default class Avatar implements IAvatar {
	public experienceScene: IExperienceScene;
	public camera: ExperienceCamera;
	public readonly type: AvatarType = AvatarType.VISITOR
	private avatarControls: AvatarControls | null = null;
	public model: Object3D | null = null;
	public mixer: AnimationMixer = new AnimationMixer(new Mesh());
	public animationsMap: Map<AnimationName, AnimationAction> = new Map();

	constructor(experienceScene: IExperienceScene, camera: ExperienceCamera, type: AvatarType = AvatarType.VISITOR) {
		this.experienceScene = experienceScene;
		this.camera = camera;
		this.type = type;

		// Initiate avatar
		this.init();
	}

	async init() {
		// Load model
		await this.load();

		// Setup avatar controls
		this.avatarControls = new AvatarControls(this);

		// Make sure controls are connected
		this.avatarControls.connect();
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

		// Add avatar to experienceScene
		this.experienceScene.scene.add(this.model);
	}

	update(delta: number): void {
		if(this.avatarControls) {
			// Update controls
			this.avatarControls.update(delta, this.avatarControls.keysPressed);
		}

		// Update the mixer
		this.mixer.update(delta);
	}

	destroy() {
		if(!this.model) {
			return;
		}

		if(this.avatarControls) {
			// Disconnect avatar controls
			this.avatarControls.disconnect();
		}

		// Remove model from experienceScene
		this.experienceScene.scene.remove(this.model);
	}
}