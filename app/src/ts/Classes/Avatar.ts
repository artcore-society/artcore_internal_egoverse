import { gsap } from 'gsap';
import { IAvatar } from '../Interfaces/IAvatar.ts';
import { AvatarType } from '../Enums/AvatarType.ts';
import { ThreeLoaders } from './ThreeLoaders.ts';
import { AnimationName } from '../Enums/AnimationName.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import { IExtendedObject3D } from '../Interfaces/IExtendedObject3D.ts';
import { AnimationAction, AnimationClip, AnimationMixer, Mesh, Vector3, Quaternion } from 'three';
import AvatarControls from './AvatarControls.ts';
import ExperienceCamera from './ExperienceCamera.ts';
import ExperienceScene from './ExperienceScene.ts';

export default class Avatar implements IAvatar {
	public experienceScene: IExperienceScene;
	public camera: ExperienceCamera;
	public readonly type: AvatarType = AvatarType.VISITOR
	public controls: AvatarControls | null = null;
	public model: IExtendedObject3D | null = null;
	public mixer: AnimationMixer = new AnimationMixer(new Mesh());
	public animationsMap: Map<AnimationName, AnimationAction> = new Map();
	public spawnPosition: Vector3;
	public spawnRotation: Quaternion;

	constructor (experienceScene: ExperienceScene, camera: ExperienceCamera, type: AvatarType, spawnPosition: Vector3 = new Vector3(), spawnRotation: Quaternion = new Quaternion()) {
		this.experienceScene = experienceScene;
		this.camera = camera;
		this.type = type;
		this.spawnPosition = spawnPosition;
		this.spawnRotation = spawnRotation;

		// Initiate avatar
		this.init();
	}

	async init() {
		// Load model
		await this.load();

		// Setup avatar controls
		this.controls = new AvatarControls(this);

		if(this.type === AvatarType.CURRENT_PLAYER) {
			// Make sure controls are connected
			this.controls.connect();
		}
	}

	async load() {
		try {
			const gltf = await ThreeLoaders.loadGLTF('/assets/models/avatar/avatar.gltf');

			// Set class model
			this.model = gltf.scene;

			// Custom attribute marking model as avatar
			this.model.isAvatar = true;

			// Set spawn position and rotation
			this.model.position.set(this.spawnPosition.x, this.spawnPosition.y, this.spawnPosition.z);
			this.model.quaternion.set(this.spawnRotation.x, this.spawnRotation.y, this.spawnRotation.z, this.spawnRotation.w);

			// Setup shadows
			this.model.castShadow = true;
			this.model.receiveShadow = true;

			// Filter out the T pose animation
			const filteredAnimations = [...gltf.animations.filter((animation: AnimationClip) => animation.name !== 'TPose')];

			// Set animation mixer
			this.mixer = new AnimationMixer(this.model);

			// Set animations map
			filteredAnimations.forEach((animation: AnimationClip) => {
				this.animationsMap.set(animation.name as AnimationName, this.mixer.clipAction(animation));
			});

			// Add avatar to experienceScene
			this.experienceScene.scene.add(this.model);

			// Make sure all tweens are killed first
			gsap.killTweensOf(this.model.scale);

			// Animate in character
			gsap.fromTo(this.model.scale, { x: 0, y: 0, z: 0 }, {
				x: 1,
				y: 1,
				z: 1,
				ease: 'back.out',
				duration: 1,
			});
		} catch (error) {
			console.error(error);
			throw new Error('Something went wrong loading the avatar model');
		}
	}

	update(delta: number): void {
		// Update the mixer
		this.mixer.update(delta);

		if(this.controls) {
			// Update controls
			this.controls.update(delta, this.controls.keysPressed);
		}
	}

	destroy() {
		if(this.controls) {
			// Disconnect avatar controls
			this.controls.disconnect();
		}

		if(this.model) {
			// Remove model from experienceScene
			this.experienceScene.scene.remove(this.model);

			// Make sure all tweens are killed first
			gsap.killTweensOf(this.model.scale);

			// Animate in character
			gsap.to(this.model.scale, {
				x: 0,
				y: 0,
				z: 0,
				ease: 'back.out',
				duration: 1,
				onComplete: () => {
					if(this.model) {
						// Remove model from experienceScene
						this.experienceScene.scene.remove(this.model);
					}
				}
			});
		}
	}
}