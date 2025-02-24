import { AvatarType } from '../Enums/AvatarType.ts';
import { KeyboardKey } from '../Enums/KeyboardKey.ts';
import { AnimationName } from '../Enums/AnimationName.ts';
import { IAvatarControls } from '../Interfaces/IAvatarControls.ts';
import { Quaternion, Vector3 } from 'three';
import Avatar from './Avatar.ts';

export default class AvatarControls implements IAvatarControls {
	private readonly avatar: Avatar;
	private currentAction: AnimationName = AnimationName.HAPPY_IDLE;
	private walkDirection: Vector3 = new Vector3();
	private rotateAngle: Vector3 = new Vector3(0, 1, 0);
	private rotateQuaternion: Quaternion = new Quaternion();
	private isJumping: boolean = false;
	private fadeDuration: number = 0.2;
	private runVelocity: number = 5;
	private walkVelocity: number = 2;
	private jumpAnimationTimeout: ReturnType<typeof setTimeout> | null = null;
	public keysPressed: { [key in KeyboardKey]: boolean } = {} as { [key in KeyboardKey]: boolean };
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

	constructor(avatar: Avatar) {
		// Set properties
		this.avatar = avatar;

		if(this.avatar.type === AvatarType.CURRENT_PLAYER) {
			// Make sure camera parent position is starts at spawn position
			this.avatar.experienceScene.cameraParent.position.set(this.avatar.spawnPosition.x, this.avatar.spawnPosition.y, this.avatar.spawnPosition.z);
		}

		// Call animation when corresponding key is pressed
		this.avatar.animationsMap.forEach((animation, key) => {
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
		if(!this.avatar.model) {
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
			play = AnimationName.RUNNING;
		} else {
			play = AnimationName.HAPPY_IDLE;
		}

		// Do the animation if it's not already the current animation state
		if (this.currentAction !== play && !this.isJumping && this.avatar) {
			// Do a transition to the new animation state
			const animationToPlay = this.avatar.animationsMap.get(play) ?? this.avatar.animationsMap.get(AnimationName.HAPPY_IDLE);
			const currentAnimation = this.avatar.animationsMap.get(this.currentAction);

			if(!animationToPlay || !currentAnimation) return;

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

			// Rotate avatar model
			this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, angleYCameraAngle);

			// Smoothly rotate avatar model using slerp and apply delta to make it frame independent
			this.avatar.model?.quaternion.slerp(this.rotateQuaternion, Math.min(3 * delta, 1));

			if(this.avatar.type !== AvatarType.VISITOR) {
				// Calculate direction
				this.avatar.camera.getWorldDirection(this.walkDirection);
			} else {
				const visitorWorldDirection = this.avatar.camera.getWorldDirection(new Vector3());
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

			// Move avatar & camera
			const moveX = this.walkDirection.x * velocity * delta;
			const moveZ = this.walkDirection.z * velocity * delta;

			// Update avatar position
			this.avatar.model.position.x += moveX;
			this.avatar.model.position.z += moveZ;

			if(this.avatar.type === AvatarType.CURRENT_PLAYER) {
				// Sync camera with current player avatar
				this.avatar.experienceScene.cameraParent.position.x = this.avatar.model.position.x;
				this.avatar.experienceScene.cameraParent.position.z = this.avatar.model.position.z;
			}
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