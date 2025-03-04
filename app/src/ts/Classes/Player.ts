import { gsap } from 'gsap';
import { IPlayer } from '../Interfaces/IPlayer.ts';
import { AnimationName } from '../Enums/AnimationName.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import { IExtendedObject3D } from '../Interfaces/IExtendedObject3D.ts';
import { AnimationAction, AnimationClip, AnimationMixer, Mesh, Vector3, Quaternion } from 'three';
import PlayerControls from './PlayerControls.ts';
import ExperienceCamera from './ExperienceCamera.ts';
import ExperienceScene from './ExperienceScene.ts';
import ExperienceManager from './ExperienceManager.ts';

export default class Player implements IPlayer {
	public username: string;
	public modelId: number;
	public experienceScene: IExperienceScene;
	public camera: ExperienceCamera;
	public isCurrent: boolean = false;
	public controls: PlayerControls | null = null;
	public model: IExtendedObject3D | null = null;
	public mixer: AnimationMixer = new AnimationMixer(new Mesh());
	public animationsMap: Map<AnimationName, AnimationAction> = new Map();
	public spawnPosition: Vector3;
	public spawnRotation: Quaternion;

	constructor(
		username: string,
		modelId: number,
		experienceScene: ExperienceScene,
		camera: ExperienceCamera,
		isCurrent: boolean = false,
		spawnPosition: Vector3 = new Vector3(),
		spawnRotation: Quaternion = new Quaternion()
	) {
		console.log('test');
		this.username = username;
		this.modelId = modelId;
		this.experienceScene = experienceScene;
		this.camera = camera;
		this.spawnPosition = spawnPosition;
		this.spawnRotation = spawnRotation;
		this.isCurrent = isCurrent;

		// Initiate the player
		this.init();
	}

	async init() {
		// Load model
		await this.load();

		// Setup player controls
		this.controls = new PlayerControls(this);

		if (this.isCurrent) {
			// Make sure controls are connected
			this.controls.connect();
		}
	}

	async load() {
		try {
			const { model, animations } = await ExperienceManager.instance.fetchOrLoadPlayerCacheEntry(
				this.modelId,
				this.spawnPosition,
				this.spawnRotation
			);

			// Set model
			this.model = model;

			// Filter out the T pose animation
			const filteredAnimations = [...animations.filter((animation: AnimationClip) => animation.name !== 'TPose')];

			// Set animation mixer
			this.mixer = new AnimationMixer(this.model);

			// Set animations map
			filteredAnimations.forEach((animation: AnimationClip) => {
				this.animationsMap.set(animation.name as AnimationName, this.mixer.clipAction(animation));
			});

			// Add player to experienceScene
			this.experienceScene.scene.add(this.model);

			// Make sure all tweens are killed first
			gsap.killTweensOf(this.model.scale);

			// Animate in character
			gsap.fromTo(
				this.model.scale,
				{ x: 0, y: 0, z: 0 },
				{
					x: 1,
					y: 1,
					z: 1,
					ease: 'back.out',
					duration: 1
				}
			);
		} catch (error) {
			console.error(error);
			throw new Error('Something went wrong loading the player model');
		}
	}

	update(delta: number): void {
		// Update the mixer
		this.mixer.update(delta);

		if (this.controls && ExperienceManager.instance.isInteractive) {
			// Update controls
			this.controls.update(delta, this.controls.keysPressed);
		}
	}

	destroy() {
		if (this.controls) {
			// Disconnect player controls
			this.controls.disconnect();
		}

		if (this.model) {
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
					if (this.model) {
						// Remove model from experienceScene
						this.experienceScene.scene.remove(this.model);
					}
				}
			});
		}
	}
}
