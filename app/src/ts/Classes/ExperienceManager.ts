import { gsap } from 'gsap';
import { SceneKey } from '../Enums/SceneKey';
import { SocketEvent } from '../Enums/SocketEvent.ts';
import { EventService } from '../Services/EventService.ts';
import { CustomEventKey } from '../Enums/CustomEventKey.ts';
import { ExperienceSocket } from './ExperienceSocket.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import { Clock, DefaultLoadingManager, LoadingManager } from 'three';
import ExperienceRenderer from './ExperienceRenderer.ts';
import { ISocketInitData } from '../Interfaces/ISocketInitData.ts';
import { ISocketUserData } from '../Interfaces/ISocketUserData.ts';
import { ISocketClientUpdatePlayerData } from '../Interfaces/ISocketClientUpdatePlayerData.ts';
import { ISocketJoinSceneData } from '../Interfaces/ISocketJoinSceneData.ts';
import { ISocketClientSpawnPlayerData } from '../Interfaces/ISocketClientSpawnPlayerData.ts';

export default class ExperienceManager {
	private static _instance: ExperienceManager | null = null;
	private canvas: HTMLCanvasElement | null = null;
	public clock: Clock;
	public userId: string | null = null;
	private renderer: ExperienceRenderer | null = null;
	private scenes: Map<SceneKey, IExperienceScene>;
	private animateFrameId: number | null = null;
	public activeScene: IExperienceScene | null = null;
	private loaderManager: LoadingManager;

	private constructor() {
		this.clock = new Clock();
		this.scenes = new Map();
		this.loaderManager = DefaultLoadingManager;
	}

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
				sceneKey: this.activeScene?.sceneKey
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
			targetScene.addVisitor(data.visitorId);
		});

		ExperienceSocket.on<ISocketClientUpdatePlayerData>(SocketEvent.CLIENT_UPDATE_PLAYER, (data) => {
			// Update avatar
			if (this.activeScene && this.activeScene.visitorAvatars && this.activeScene.sceneKey === data.sceneKey) {
				// Make sure visitor position starts at initial position
				this.activeScene.visitorAvatars[data.visitorId]?.model?.position.set(data.initialPosition.x, data.initialPosition.y, data.initialPosition.z);

				// Update the mixer of the visitor avatar
				this.activeScene.visitorAvatars[data.visitorId]?.mixer?.update(data.delta);

				// Update the controls of the visitor avatar
				this.activeScene.visitorAvatars[data.visitorId]?.controls?.update(data.delta, data.keysPressed);
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
					this.activeScene.addCurrentPlayer();
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
			targetScene.addVisitor(data.userId);

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
		});
	}

	private addEventListeners() {
		window.addEventListener('resize', () => this.resize());
	}

	private removeEventListeners() {
		window.removeEventListener('resize', () => this.resize());
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

	private animate(): void {
		// Get delta time
		const delta = this.clock.getDelta();

		if (this.activeScene && this.renderer) {
			this.activeScene.update(delta);

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
}