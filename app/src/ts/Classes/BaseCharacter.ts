import { gsap } from 'gsap';
import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { AnimationName } from '../Enums/AnimationName.ts';
import { IBaseCharacter } from '../Interfaces/IBaseCharacter.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import { AnimationAction, AnimationClip, AnimationMixer, Mesh, Object3D, Quaternion, Vector3 } from 'three';
import ExperienceScene from './ExperienceScene.ts';
import ExperienceManager from './ExperienceManager.ts';
import PlayerControls from './PlayerControls.ts';
import NpcControls from './NpcControls.ts';
import ExperienceCamera from './ExperienceCamera.ts';

export default class BaseCharacter implements IBaseCharacter {
	public animationsMap: Map<string, AnimationAction>;
	public experienceScene: IExperienceScene;
	public mixer: AnimationMixer;
	public model: Object3D;
	public modelPrefix: ModelPrefix;
	public modelId: number;
	public controls: PlayerControls | NpcControls | null = null;
	public camera: ExperienceCamera;
	public spawnPosition: Vector3;
	public spawnRotation: Quaternion;
	public username: string;

	constructor(
		username: string,
		modelPrefix: ModelPrefix,
		modelId: number,
		camera: ExperienceCamera,
		experienceScene: ExperienceScene,
		spawnPosition: Vector3 = new Vector3(),
		spawnRotation: Quaternion = new Quaternion()
	) {
		this.username = username;
		this.modelPrefix = modelPrefix;
		this.modelId = modelId;
		this.camera = camera;
		this.experienceScene = experienceScene;
		this.spawnPosition = spawnPosition;
		this.spawnRotation = spawnRotation;
		this.animationsMap = new Map();
		this.model = new Object3D();
		this.mixer = new AnimationMixer(new Mesh());
	}

	async init(): Promise<void> {
		// Load model
		await this.load();
	}

	async load(): Promise<void> {
		try {
			const { model, animations } = await ExperienceManager.instance.fetchOrLoadModelCacheEntry(
				this.modelPrefix,
				this.modelId,
				this.spawnPosition,
				this.spawnRotation
			);

			// Set model
			this.model = model;

			// Filter out the T pose animation
			const filteredAnimations = [
				...animations.filter((animation: AnimationClip) => animation.name !== AnimationName.TPOSE)
			];

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
					duration: 1,
					onComplete: () => {
						this.model;
					}
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

	destroy(): void {
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
