import { gsap } from 'gsap';
import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { AnimationName } from '../Enums/AnimationName.ts';
import { IBaseCharacter } from '../Interfaces/IBaseCharacter.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import { AnimationAction, AnimationClip, AnimationMixer, Box3, Mesh, Object3D, Quaternion, Vector3 } from 'three';
import ExperienceScene from './ExperienceScene.ts';
import ExperienceManager from './ExperienceManager.ts';
import PlayerControls from './PlayerControls.ts';
import NpcControls from './NpcControls.ts';
import ExperienceCamera from './ExperienceCamera.ts';
import Player from './Player.ts';
import Text3D from './Text3D.ts';

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
	public usernameLabel: Object3D | null = null;
	public modelHeight: number | null = null;

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
		// Create the character
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
						// Add username label
						this.addUsernameLabel();
					}
				}
			);
		} catch (error) {
			console.error(error);
		}
	}

	async addUsernameLabel() {
		if (this instanceof Player && this.isCurrent) {
			return;
		}

		// Create 3D text
		this.usernameLabel = await Text3D.createText(this.username, '/assets/fonts/rubik.json');

		// Get model height
		const bbox = new Box3();
		bbox.setFromObject(this.model, true);

		// Calculate model height
		this.modelHeight = bbox.max.y - bbox.min.y;

		// Define target y position
		const targetPositionY = this.modelHeight + 0.1;

		// Set y position right above model height using offset
		this.usernameLabel.position.y = targetPositionY;

		// Add to scene
		this.experienceScene.scene.add(this.usernameLabel);

		// Make sure all tweens are killed first
		gsap.killTweensOf(this.usernameLabel.scale);
		gsap.killTweensOf(this.usernameLabel.position);

		// Create timeline
		const tl: GSAPTimeline = gsap.timeline();

		// Animate in character
		tl.fromTo(
			this.usernameLabel.scale,
			{ x: 0, y: 0, z: 0 },
			{
				x: 1,
				y: 1,
				z: 1,
				ease: 'back.out',
				duration: 1
			},
			'0'
		).fromTo(
			this.usernameLabel.position,
			{ x: 0, y: targetPositionY + 0.5, z: 0 },
			{
				x: 0,
				y: targetPositionY,
				z: 0,
				ease: 'back.out',
				duration: 1
			},
			'0'
		);
	}

	update(delta: number): void {
		// Update the mixer
		this.mixer.update(delta);

		// Sync position of avatar label with character position
		if (this.usernameLabel) {
			// Sync position
			this.usernameLabel.position.x = this.model.position.x;
			this.usernameLabel.position.z = this.model.position.z;
		}

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
					if (this.usernameLabel) {
						// Remove username label from experienceScene
						this.experienceScene.scene.remove(this.usernameLabel);
					}

					if (this.model) {
						// Remove model from experienceScene
						this.experienceScene.scene.remove(this.model);
					}
				}
			});
		}
	}
}
