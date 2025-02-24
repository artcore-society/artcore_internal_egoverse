import { gsap } from 'gsap';
import { SceneKey } from '../Enums/SceneKey';
import { ref, Ref } from 'vue';
import { SocketEvent } from '../Enums/SocketEvent.ts';
import { EventService } from '../Services/EventService.ts';
import { CustomEventKey } from '../Enums/CustomEventKey.ts';
import { ISocketUserData } from '../Interfaces/ISocketUserData.ts';
import { ISocketInitData } from '../Interfaces/ISocketInitData.ts';
import { ExperienceSocket } from './ExperienceSocket.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import { ISocketMessageData } from '../Interfaces/ISocketMessageData.ts';
import { ISocketJoinSceneData } from '../Interfaces/ISocketJoinSceneData.ts';
import { ISocketClientSpawnPlayerData } from '../Interfaces/ISocketClientSpawnPlayerData.ts';
import { ISocketClientUpdatePlayerData } from '../Interfaces/ISocketClientUpdatePlayerData.ts';
import {
	Clock,
	DefaultLoadingManager,
	LoadingManager,
	Object3D,
	Quaternion,
	Raycaster,
	Vector2,
	Vector3
} from 'three';
import ExperienceRenderer from './ExperienceRenderer.ts';
import Avatar from './Avatar.ts';

export default class ExperienceManager {
	private static _instance: ExperienceManager | null = null;
	private canvas: HTMLCanvasElement | null = null;
	public clock: Clock = new Clock();
	public userId: string | null = null;
	private renderer: ExperienceRenderer | null = null;
	private scenes: Map<SceneKey, IExperienceScene> = new Map();
	private animateFrameId: number | null = null;
	public activeScene: IExperienceScene | null = null;
	private loaderManager: LoadingManager = DefaultLoadingManager;
	private raycaster: Raycaster = new Raycaster();
	private pointer: Vector2 | null = null;
	private hoveredAvatar: Avatar | null = null;
	public selectedAvatar: Ref<Avatar | null> = ref(null);
	public incomingVisitorMessageData: Ref<string> | null = ref(null);
	public isInteractive: boolean = true;

	private constructor() {}

	public static get instance(): ExperienceManager {
		if (!ExperienceManager._instance) {
			ExperienceManager._instance = new ExperienceManager();
		}
		return ExperienceManager._instance;
	}

	public init(canvas: HTMLCanvasElement): void {
		if (this.canvas) {
			// Prevent re-initialization
			throw new Error('ExperienceManager is already initialized');
		}

		// Init...
		this.canvas = canvas;
		this.renderer = new ExperienceRenderer(this.canvas);
		this.updateSceneCamerasAndRenderSize();

		// Add event listeners
		this.addEventListeners();

		// Handle scene loading
		this.handleSceneLoading();

		// Setup websocket event listeners
		this.setupSocketListeners();
	}

	private setupSocketListeners(): void {
		ExperienceSocket.on<ISocketInitData>(SocketEvent.INIT, (data) => {
			console.log('Socket init!', data);

			// Set current user id
			this.userId = data.id;

			// Set the default active scene
			this.setActiveScene(SceneKey.LANDING_AREA);
		});

		ExperienceSocket.on<ISocketUserData>(SocketEvent.USER_CONNECT, (data) => {
			console.log('User connected!', data);

			ExperienceSocket.emit(SocketEvent.CLIENT_SPAWN_PLAYER, {
				userId: data.id,
				visitorId: ExperienceManager.instance.userId,
				sceneKey: this.activeScene?.sceneKey,
				spawnPosition: this.activeScene?.currentPlayerAvatar?.model?.position,
				spawnRotation: this.activeScene?.currentPlayerAvatar?.model?.quaternion,
			});
		});

		ExperienceSocket.on<ISocketUserData>(SocketEvent.USER_DISCONNECT, (data) => {
			console.log('User disconnected!', data);
			this.activeScene?.removeVisitor(data.id);
		});

		ExperienceSocket.on<ISocketClientSpawnPlayerData>(SocketEvent.CLIENT_SPAWN_PLAYER, (data) => {
			console.log('Spawn new player!', data);

			// Get target scene
			const targetScene = this.scenes.get(data.sceneKey) ?? null;

			if(!targetScene) {
				return;
			}

			// Add visitor for id to target scene
			targetScene.addVisitor(
				data.visitorId,
				new Vector3(data.spawnPosition.x, data.spawnPosition.y, data.spawnPosition.z), // Convert websocket data to Vector3
				new Quaternion(...data.spawnRotation) // Convert websocket data to Quaternion
			);
		});

		ExperienceSocket.on<ISocketClientUpdatePlayerData>(SocketEvent.CLIENT_UPDATE_PLAYER, (data) => {
			const targetScene = this.scenes.get(data.sceneKey) ?? null;

			if(!targetScene) {
				return;
			}

			// Update avatar in target scene
			if (targetScene && targetScene.visitorAvatars && targetScene.sceneKey === data.sceneKey) {
				// Update the mixer of the visitor avatar
				targetScene.visitorAvatars[data.visitorId]?.mixer?.update(data.delta);

				// Update the controls of the visitor avatar
				targetScene.visitorAvatars[data.visitorId]?.controls?.update(data.delta, data.keysPressed);
			}
		});

		ExperienceSocket.on<ISocketJoinSceneData>(SocketEvent.JOIN_SCENE, (data) => {
			const isCurrentPlayer = data.userId === this.userId;

			if(isCurrentPlayer) {
				// Current player
				if(
					this.activeScene
				) {
					// Add current player avatar to active scene
					this.activeScene.addCurrentPlayer(this.userId);
				}

				return;
			}

			// Visitor

			// Get target scene
			const targetScene = this.scenes.get(data.sceneKey) ?? null;

			if(!targetScene) {
				return;
			}

			// Add visitor for id to target scene
			targetScene.addVisitor(
				data.userId,
				new Vector3(data.spawnPosition.x, data.spawnPosition.y, data.spawnPosition.z), // Convert websocket data to Vector3
				new Quaternion(...data.spawnRotation) // Convert websocket data to Quaternion
			);

			// Check if visitor is present in any other scene and remove if so
			const otherScenes: Array<IExperienceScene> = [...this.scenes.values()].filter(scene => scene.sceneKey !== data.sceneKey);
			if(otherScenes && otherScenes.length !== 0) {
				const otherScenesWhereVisitorIsStillPresent = otherScenes.filter(scene => scene.visitorAvatars[data.userId]);

				otherScenesWhereVisitorIsStillPresent.forEach(scene => {
					// Remove visitor from scene
					scene.removeVisitor(data.userId);
				});
			}
		});

		ExperienceSocket.on<ISocketMessageData>(SocketEvent.SEND_MESSAGE, (data) => {
			console.log('Message received', data)

			// Set ref
			this.incomingVisitorMessageData.value = data;
		});
	}

	addScene(key: SceneKey, scene: IExperienceScene): void {
		this.scenes.set(key, scene);
	}

	setActiveScene(key: SceneKey): void {
		// Check if the scene exists
		if (!this.scenes.has(key)) {
			console.warn(`Scene "${key}" not found.`);
			return;
		}

		if(this.activeScene && this.activeScene.sceneKey === key) {
			return;
		}

		if(this.activeScene && this.activeScene.currentPlayerAvatar && this.activeScene.currentPlayerAvatar.model) {
			// Make sure all tweens are killed first
			gsap.killTweensOf(this.activeScene.currentPlayerAvatar.model.scale);

			// First remove current player from previous active scene
			gsap.to(this.activeScene.currentPlayerAvatar.model.scale,{
				x: 0,
				y: 0,
				z: 0,
				duration: 0.4,
				ease: 'back.inOut',
				onComplete: () => {
					// Remove active player from previous scene
					this.activeScene?.removeCurrentPlayer();

					// Set new active scene
					this.activeScene = this.scenes.get(key) || null;

					// Emit join room
					ExperienceSocket.emit(SocketEvent.JOIN_SCENE, {
						userId: this.userId,
						sceneKey: key,
						spawnPosition: this.activeScene?.currentPlayerAvatar?.model?.position ?? new Vector3(),
						spawnRotation: this.activeScene?.currentPlayerAvatar?.model?.quaternion ?? new Quaternion(),
					});
				}
			});

			return;
		}

		// Set new active scene
		this.activeScene = this.scenes.get(key) || null;

		// Emit join room
		ExperienceSocket.emit(SocketEvent.JOIN_SCENE, {
			userId: this.userId,
			sceneKey: key,
			spawnPosition: this.activeScene?.currentPlayerAvatar?.model?.position ?? new Vector3(),
			spawnRotation: this.activeScene?.currentPlayerAvatar?.model?.quaternion ?? new Quaternion(),
		});
	}

	private addEventListeners() {
		window.addEventListener('resize', () => this.resize());
		this.canvas.addEventListener( 'pointermove', (event: PointerEvent) => this.onPointerMove(event));
		this.canvas.addEventListener( 'click', () => this.checkIntersectingPlayer());
	}

	private removeEventListeners() {
		window.removeEventListener('resize', () => this.resize());
		this.canvas.removeEventListener( 'pointermove', (event: PointerEvent) => this.onPointerMove(event));
		this.canvas.removeEventListener( 'click', () => this.checkIntersectingPlayer());
	}

	private handleSceneLoading() {
		// On load
		this.loaderManager.onLoad = () => {
			// Start animation loop
			this.animate();

			// Dispatch is ready event
			EventService.dispatch(CustomEventKey.READY);
		};
	}

	handleRaycaster() {
		if (!this.activeScene || !this.pointer) {
			return;
		}

		// Update the picking ray with the camera and pointer position
		this.raycaster.setFromCamera(this.pointer, this.activeScene.camera);

		// Calculate objects intersecting the picking ray
		const intersects = this.raycaster.intersectObjects(this.activeScene.scene.children, true);

		// Find the first intersected object that belongs to an avatar
		const avatarIntersect = intersects.find(intersect => {
			let obj = intersect.object;

			// Traverse up the parent hierarchy to find the avatar root
			while (obj) {
				if (obj.isAvatar) {
					return true;
				}
				obj = obj.parent as Object3D;
			}
			return false;
		});

		if (avatarIntersect) {
			// Get the actual avatar root object
			let avatarRoot = avatarIntersect.object;
			while (avatarRoot && !avatarRoot.isAvatar) {
				avatarRoot = avatarRoot.parent as Object3D;
			}

			if(this.activeScene?.currentPlayerAvatar?.model && avatarRoot) {
				// Find the actual class instance
				this.hoveredAvatar = Object.values(this.activeScene?.visitorAvatars).find((avatar: Avatar) => avatar.model?.uuid === avatarRoot.uuid) ?? null;

				if(this.hoveredAvatar) {
					if(!document.body.classList.contains('cursor-pointer')) {
						document.body.classList.add('cursor-pointer');
					}
				}
			}

			return;
		}

		// Make sure to remove cursor class
		document.body.classList.remove('cursor-pointer');

		// Reset hovered adn selected avatar when not hovering anymore
		this.hoveredAvatar = null;
	}


	private animate(): void {
		// Get delta time
		const delta = this.clock.getDelta();

		if (this.activeScene && this.renderer) {
			// Update the active scene
			this.activeScene.update(delta);

			// Handle raycaster
			this.handleRaycaster();

			// Render the renderer
			this.renderer.render(this.activeScene.scene, this.activeScene.camera);
		}

		// Request new frame
		this.animateFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	private updateSceneCamerasAndRenderSize() {
		this.scenes.forEach((scene) => {
			// Update camera of all scenes
			scene.camera.aspect = window.innerWidth / window.innerHeight;
			scene.camera.updateProjectionMatrix();
		})

		if(this.renderer) {
			// Set canvas size again
			this.renderer.setSize(window.innerWidth, window.innerHeight);
		}
	}

	resize(): void {
		this.updateSceneCamerasAndRenderSize();
	}

	onPointerMove(event: PointerEvent) {
		if(!this.pointer) {
			this.pointer = new Vector2();
		}

		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components

		this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}

	checkIntersectingPlayer() {
		if (!this.selectedAvatar.value && this.hoveredAvatar) {
			// Set ref so popup modal opens
			this.selectedAvatar.value = this.hoveredAvatar;
		}
	}

	destroy(): void {
		if (this.animateFrameId) {
			// Cancel next frame
			cancelAnimationFrame(this.animateFrameId);
		}

		// Destroy the active scene
		if (this.activeScene) {
			this.activeScene.destroy();
		}

		// Destroy all scenes in the map
		this.scenes.forEach((scene) => {
			scene.destroy();
		});

		// Remove event listeners
		this.removeEventListeners();

		if(this.renderer) {
			// Dispose of the renderer
			this.renderer.dispose();
		}
	}

	setInteractiveState(value: boolean) {
		this.isInteractive = value;
	}
}