import { Object3D } from 'three';
import isMobile from 'ismobilejs';
import Avatar from './Avatar.ts';

export class CameraControls {
	private readonly avatar: Avatar;
	private readonly domElement: HTMLElement;
	private orbit: Object3D = new Object3D();
	private previousTouch: Touch | null = null;
	private readonly boundOnPointerMove: (event: PointerEvent) => void;
	private readonly boundOnTouchMove: (event: TouchEvent) => void;
	private readonly boundOnTouchEnd: (event: TouchEvent) => void;
	private isSmartPhone: boolean = isMobile(navigator.userAgent).phone;
	private isTablet: boolean = (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1) ||
		isMobile(navigator.userAgent).apple.tablet;

	constructor(avatar: Avatar, domElement: HTMLElement) {
		// Set variables
		this.avatar = avatar;
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none';

		this.orbit.add(this.avatar.camera);
		this.boundOnPointerMove = this.onPointerMove.bind(this);
		this.boundOnTouchMove = this.onTouchMove.bind(this);
		this.boundOnTouchEnd = this.onTouchEnd.bind(this);

		// Setup orbit
		this.orbit.rotation.order = 'YXZ';
		this.orbit.position.copy(this.avatar.position);
		this.orbit.rotation.x = -0.3;
		this.avatar.scene.add(this.orbit);
	}

	initPointerLock() {
		// Early return when on touch device
		if (this.isSmartPhone || this.isTablet) {
			return;
		}

		// Ask the browser to lock the pointer
		document.body.requestPointerLock = document.body.requestPointerLock;

		if (/Firefox/i.test(navigator.userAgent)) {
			// Make sure fullscreen events are removed first
			document.removeEventListener('fullscreenchange', () => this.onFullScreenChange);
			document.removeEventListener('mozfullscreenchange', () => this.onFullScreenChange);

			// Add fullscreen event listeners
			document.addEventListener('fullscreenchange', () => this.onFullScreenChange, false);
			document.addEventListener('mozfullscreenchange', () => this.onFullScreenChange, false);

			// Request full screen
			document.body.requestFullscreen = document.body.requestFullscreen;
			document.body.requestFullscreen();

			return;
		}

		// Request pointer lock
		document.body.requestPointerLock();
	}

	onFullScreenChange() {
		if (document.fullscreenElement === document.body) {
			document.removeEventListener('fullscreenchange', () => this.onFullScreenChange);
			document.removeEventListener('mozfullscreenchange', () => this.onFullScreenChange);

			document.body.requestPointerLock();
		}
	}

	onTouchMove(event: TouchEvent) {
		// Get current touch
		const touch = event.touches[0];

		// Only do something when controls are enabled
		if (!touch) {
			return;
		}

		// Be aware that these only store the movement of the first touch in the touches array
		const movementX = this.previousTouch ? touch.pageX - this.previousTouch.pageX : 0;
		const movementY = this.previousTouch ? touch.pageY - this.previousTouch.pageY : 0;

		// Rotate camera
		this.rotateCamera(movementX, movementY);

		// Keep previous touch
		this.previousTouch = touch;
	}

	onTouchEnd() {
		this.previousTouch = null;
	}

	onPointerMove(event: PointerEvent) {
		// Rotate camera
		this.rotateCamera(event.movementX, event.movementY);
	}

	rotateCamera(movementX: number, movementY: number) {
		// Set scale
		const scale = -0.01;

		// Calculate angle
		const rotateXAngle = movementX * scale;
		const rotateYAngle = movementY * scale;

		// Apply angle
		this.orbit.rotateY(rotateXAngle);

		if (-1 <= this.orbit.rotation.x + rotateYAngle && this.orbit.rotation.x + rotateYAngle <= 0) {
			// Limit vertical rotation
			this.orbit.rotateX(rotateYAngle);
		}

		// Keep z rotation fixed to keep the camera leveled
		this.orbit.rotation.z = 0;
	}

	onPointerLockChange() {
		if (document.pointerLockElement === document.body) {
			// Connect controls
			this.connect();

			return;
		}

		// Disconnect controls
		this.disconnect();
	}

	connect() {
		// Add event listener
		if (!this.isSmartPhone && !this.isTablet) {
			// Desktop event listener
			document.addEventListener('pointermove', this.boundOnPointerMove);

			return;
		}

		// Touch device listener
		document.addEventListener('touchmove', this.boundOnTouchMove, false);
		document.addEventListener('touchend', this.boundOnTouchEnd, false);
	}

	disconnect() {
		// Remove event listener
		if (!this.isSmartPhone && !this.isTablet) {
			// Desktop event listener
			document.removeEventListener('pointermove', this.boundOnPointerMove);

			return;
		}

		// Touch device listener
		document.removeEventListener('touchmove', this.boundOnTouchMove, false);
		document.removeEventListener('touchend', this.boundOnTouchEnd, false);
	}
}
