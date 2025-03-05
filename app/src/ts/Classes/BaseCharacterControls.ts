import { KeyboardKey } from '../Enums/KeyboardKey.ts';
import { AnimationName } from '../Enums/AnimationName.ts';
import { IBaseCharacter } from '../Interfaces/IBaseCharacter.ts';
import { Quaternion, Vector3 } from 'three';
import { IBaseCharacterControls } from '../Interfaces/IBaseCharacterControls.ts';
import Player from './Player.ts';

export default class BaseCharacterControls implements IBaseCharacterControls {
	private readonly character: IBaseCharacter;
	private currentAction: AnimationName = AnimationName.IDLE;
	private walkDirection: Vector3 = new Vector3();
	private rotateAngle: Vector3 = new Vector3(0, 1, 0);
	private rotateQuaternion: Quaternion = new Quaternion();
	private isJumping: boolean = false;
	private fadeDuration: number = 0.2;
	private runVelocity: number = 5;
	private walkVelocity: number = 2;
	private jumpAnimationTimeout: ReturnType<typeof setTimeout> | null = null;
	private overwriteAnimationTimeout: ReturnType<typeof setTimeout> | null = null;
	private overwriteAnimationName: AnimationName | null = null;
	public keysPressed: { [key in KeyboardKey]: boolean } = {} as {
		[key in KeyboardKey]: boolean;
	};
	private directions: KeyboardKey[] = [
		KeyboardKey.KeyW,
		KeyboardKey.KeyA,
		KeyboardKey.KeyS,
		KeyboardKey.KeyD,
		KeyboardKey.ArrowUp,
		KeyboardKey.ArrowDown,
		KeyboardKey.ArrowLeft,
		KeyboardKey.ArrowRight
	];

	constructor(character: IBaseCharacter) {
		// Set properties
		this.character = character;

		// Call animation when corresponding key is pressed
		this.character.animationsMap.forEach((animation, key) => {
			if (key === this.currentAction) {
				// Play the animation
				animation.play();
			}
		});
	}

	connect() {
		// Disconnect first to make sure event listeners only exist ones
		this.disconnect();

		// Add event listeners
		document.addEventListener('keydown', this.onKeyDown.bind(this));
		document.addEventListener('keyup', this.onKeyUp.bind(this));
	}

	disconnect() {
		// Remove event listeners
		document.removeEventListener('keydown', this.onKeyDown.bind(this));
		document.removeEventListener('keyup', this.onKeyUp.bind(this));
	}

	onKeyDown(event: KeyboardEvent) {
		// Save pressed key
		this.keysPressed[event.code as KeyboardKey] = true;
	}

	onKeyUp(event: KeyboardEvent) {
		// Save pressed key
		this.keysPressed[event.code as KeyboardKey] = false;
	}

	update(delta: number, keysPressed: { [key in KeyboardKey]: boolean }) {
		if (!this.character.model) {
			return;
		}

		if (this.overwriteAnimationName) {
			return;
		}

		// Check direction
		const directionPressed = this.directions.some((key) => keysPressed[key]);

		// Check if user needs to run
		const isRunKeyPressed = keysPressed[KeyboardKey.ShiftLeft];

		// Check if user needs to jump
		const isJumpKeyPressed = keysPressed[KeyboardKey.Space];

		// Determine the animation
		let play: AnimationName | null;
		if (directionPressed && isRunKeyPressed) {
			play = AnimationName.RUNNING;

			if (isJumpKeyPressed) {
				play = AnimationName.RUNNING_JUMP;
			}
		} else if (directionPressed && !isRunKeyPressed) {
			play = AnimationName.WALKING;

			if (isJumpKeyPressed) {
				play = AnimationName.RUNNING_JUMP;
			}
		} else if (isJumpKeyPressed) {
			play = AnimationName.JUMPING;
		} else {
			play = AnimationName.IDLE;
		}

		// Do the animation if it's not already the current animation state
		if (this.currentAction !== play && !this.isJumping && this.character) {
			// Do a transition to the new animation state
			const animationToPlay =
				this.character.animationsMap.get(play) ?? this.character.animationsMap.get(AnimationName.IDLE);
			const currentAnimation = this.character.animationsMap.get(this.currentAction);

			if (!animationToPlay || !currentAnimation) return;

			const clip = animationToPlay.getClip();
			const clipDuration = clip.duration * 0.8;

			// User does combo's => the previously set timeout must be cleared to stop the new animation at the correct time
			if (isJumpKeyPressed) {
				// Clear timeout if one is already set
				if (this.jumpAnimationTimeout) {
					// Reset
					clearTimeout(this.jumpAnimationTimeout);
					this.jumpAnimationTimeout = null;
				}

				// Set jumping state
				this.isJumping = true;

				// Reset when animation is done
				this.jumpAnimationTimeout = setTimeout(() => {
					// Set false to disable jump or running jump animation
					this.isJumping = false;
				}, clipDuration * 1000);
			}

			// Fade out the current animation
			currentAnimation.fadeOut(this.fadeDuration);

			// Fade in the new animation
			animationToPlay.reset().fadeIn(this.fadeDuration).play();

			// Set the new animation state
			this.currentAction = play;
		}

		if (
			this.currentAction === AnimationName.RUNNING ||
			this.currentAction === AnimationName.WALKING ||
			this.currentAction === AnimationName.RUNNING_JUMP
		) {
			// Calculate camera Y angle
			const angleYCameraAngle = this.directionOffset(keysPressed);

			// Rotate player model
			this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, angleYCameraAngle);

			// Smoothly rotate player model using slerp and apply delta to make it frame independent
			this.character.model?.quaternion.slerp(this.rotateQuaternion, Math.min(3 * delta, 1));

			if (this.character instanceof Player && this.character.isCurrent) {
				// Calculate direction
				this.character.camera.getWorldDirection(this.walkDirection);
			} else {
				const visitorWorldDirection = this.character.camera.getWorldDirection(new Vector3());
				this.walkDirection = new Vector3(visitorWorldDirection.x, 0, visitorWorldDirection.z);
			}

			this.walkDirection.y = 0;
			this.walkDirection.normalize();
			this.walkDirection.applyAxisAngle(this.rotateAngle, angleYCameraAngle);

			// Run/walk velocity
			let velocity = 0;
			switch (this.currentAction) {
				case AnimationName.RUNNING:
					velocity = this.runVelocity;
					break;
				case AnimationName.RUNNING_JUMP:
					velocity = this.runVelocity;
					break;
				case AnimationName.WALKING:
					velocity = this.walkVelocity;
					break;
			}

			// Move player & camera
			const moveX = this.walkDirection.x * velocity * delta;
			const moveZ = this.walkDirection.z * velocity * delta;

			// Update player position
			this.character.model.position.x += moveX;
			this.character.model.position.z += moveZ;

			if (this.character instanceof Player && this.character.isCurrent) {
				// Sync camera with current player
				this.character.experienceScene.cameraParent.position.x = this.character.model.position.x;
				this.character.experienceScene.cameraParent.position.z = this.character.model.position.z;
			}
		}
	}

	playAnimation(animationName: AnimationName) {
		// Set
		this.overwriteAnimationName = animationName;

		if (this.currentAction !== animationName) {
			const animationToPlay = this.character.animationsMap.get(animationName);
			const currentAnimation = this.character.animationsMap.get(this.currentAction);

			if (!animationToPlay || !currentAnimation) {
				return;
			}

			// Clear the previous timeout if it's set
			if (this.overwriteAnimationTimeout) {
				clearTimeout(this.overwriteAnimationTimeout);
				this.overwriteAnimationTimeout = null;
			}

			// Get the duration of the animation (you may need to adjust this depending on your system)
			const clip = animationToPlay.getClip();
			const clipDuration = clip.duration * 0.95;

			// Set a timeout to reset the emote animation name after the animation duration
			this.overwriteAnimationTimeout = setTimeout(() => {
				this.overwriteAnimationName = null; // Reset the emote animation
			}, clipDuration * 1000); // Multiply by 1000 to convert to milliseconds

			// Fade out the current animation
			currentAnimation.fadeOut(this.fadeDuration);

			// Reset and fade in the new animation
			animationToPlay.reset().fadeIn(this.fadeDuration).play();
			this.currentAction = animationName;
		}
	}

	directionOffset(keysPressed: { [key in KeyboardKey]: boolean }) {
		// z
		let directionOffset = 0;

		if (keysPressed[KeyboardKey.KeyW] || keysPressed[KeyboardKey.ArrowUp]) {
			if (keysPressed[KeyboardKey.KeyA] || keysPressed[KeyboardKey.ArrowLeft]) {
				// z+q
				directionOffset = Math.PI / 4;
			} else if (keysPressed[KeyboardKey.KeyD] || keysPressed[KeyboardKey.ArrowRight]) {
				// z+d
				directionOffset = -Math.PI / 4;
			}
		} else if (keysPressed[KeyboardKey.KeyS] || keysPressed[KeyboardKey.ArrowDown]) {
			if (keysPressed[KeyboardKey.KeyA] || keysPressed[KeyboardKey.ArrowLeft]) {
				// s+q
				directionOffset = Math.PI / 4 + Math.PI / 2;
			} else if (keysPressed[KeyboardKey.KeyD] || keysPressed[KeyboardKey.ArrowRight]) {
				// s+d
				directionOffset = -Math.PI / 4 - Math.PI / 2;
			} else {
				// s
				directionOffset = Math.PI;
			}
		} else if (keysPressed[KeyboardKey.KeyA] || keysPressed[KeyboardKey.ArrowLeft]) {
			// q
			directionOffset = Math.PI / 2;
		} else if (keysPressed[KeyboardKey.KeyD] || keysPressed[KeyboardKey.ArrowRight]) {
			// d
			directionOffset = -Math.PI / 2;
		}

		return directionOffset;
	}
}
