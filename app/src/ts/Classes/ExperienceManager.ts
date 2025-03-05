import { gsap } from 'gsap';
import { SceneKey } from '../Enums/SceneKey';
import { ref, Ref } from 'vue';
import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { SocketEvent } from '../Enums/SocketEvent.ts';
import { ThreeLoaders } from './ThreeLoaders.ts';
import { EventService } from '../Services/EventService.ts';
import { CustomEventKey } from '../Enums/CustomEventKey.ts';
import { ISocketUserData } from '../Interfaces/ISocketUserData.ts';
import { ISocketInitData } from '../Interfaces/ISocketInitData.ts';
import { ExperienceSocket } from './ExperienceSocket.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import { IExtendedObject3D } from '../Interfaces/IExtendedObject3D.ts';
import { IModelCacheEntry } from '../Interfaces/IModelCacheEntry.ts';
import { ISocketMessageData } from '../Interfaces/ISocketMessageData.ts';
import { ISocketSceneStateData } from '../Interfaces/ISocketSceneStateData.ts';
import { ISocketTriggerEmoteData } from '../Interfaces/ISocketTriggerEmoteData.ts';
import { ISocketClientUpdatePlayerData } from '../Interfaces/ISocketClientUpdatePlayerData.ts';
import { Clock, DefaultLoadingManager, LoadingManager, Object3D, Quaternion, Raycaster, Vector2, Vector3 } from 'three';
import ExperienceRenderer from './ExperienceRenderer.ts';
import Player from './Player.ts';
import ExperienceScene from './ExperienceScene.ts';
import Npc from './Npc.ts';
import Stats from 'stats.js';

export default class ExperienceManager {
	private static _instance: ExperienceManager | null = null;
	private canvas: HTMLCanvasElement | null = null;
	public clock: Clock = new Clock();
	public userId: string | null = null;
	public username: string | null = null;
	public modelId: number | null = null;
	private renderer: ExperienceRenderer | null = null;
	private scenes: Map<SceneKey, IExperienceScene> = new Map();
	private animateFrameId: number | null = null;
	public activeScene: IExperienceScene | null = null;
	private loaderManager: LoadingManager = DefaultLoadingManager;
	private raycaster: Raycaster = new Raycaster();
	private pointer: Vector2 | null = null;
	private hoveredPlayer: Player | null = null;
	private hoveredNpc: Npc | null = null;
	public selectedPlayer: Ref<Player | null> = ref(null);
	public incomingVisitorMessageData: Ref<ISocketMessageData> = ref({ message: null, senderUserId: null });
	public isInteractive: boolean = true;
	private modelCache: Map<string, IModelCacheEntry> = new Map();
	private needsRaycast: boolean = false;
	private stats: Stats = new Stats();

	private constructor() {}

	public static get instance(): ExperienceManager {
		if (!ExperienceManager._instance) {
			ExperienceManager._instance = new ExperienceManager();
		}
		return ExperienceManager._instance;
	}

	public init(canvas: HTMLCanvasElement, username: string, modelId: number): void {
		if (this.canvas) {
			// Prevent re-initialization
			throw new Error('ExperienceManager is already initialized');
		}

		// Init...
		this.canvas = canvas;
		this.renderer = new ExperienceRenderer(this.canvas);
		this.username = username;
		this.modelId = modelId;
		this.updateSceneCamerasAndRenderSize();

		// Add event listeners
		this.addEventListeners();

		// Handle scene loading
		this.handleSceneLoading();

		// Setup websocket event listeners
		this.setupSocketListeners();

		// Setup stats
		this.stats.showPanel(0);
		if (!document.body.contains(this.stats.dom)) {
			document.body.appendChild(this.stats.dom);
		}
	}

	private setupSocketListeners(): void {
		ExperienceSocket.on<ISocketInitData>(SocketEvent.INIT, (data) => {
			console.log('Init', data);

			// Set user id
			this.userId = data.id;

			// Make sure scenes map starts clean/empty
			this.scenes.clear();

			// Create scenes dynamically from backend data
			data.scenes.forEach((sceneData) => {
				const scene = new ExperienceScene(this.canvas!, sceneData.sceneKey, sceneData.settings);
				this.scenes.set(sceneData.sceneKey, scene);
			});

			// Set active scene
			this.setActiveScene(data.currentSceneKey as SceneKey);
		});

		ExperienceSocket.on<ISocketSceneStateData>(SocketEvent.SCENE_STATE, (data) => {
			console.log('Scene state', data);
			// Sync visitors from active scene state
			if (data.visitors && data.visitors.length > 0) {
				data.visitors.forEach((visitor) => {
					if (this.activeScene?.players[visitor.id]) {
						// Early return if visitor is already present in scene
						return;
					}

					// Add visitor to active scene
					this.activeScene?.addVisitor(
						visitor.id,
						visitor.username,
						parseInt(visitor.modelId),
						new Vector3(...visitor.position),
						new Quaternion(...visitor.quaternion)
					);
				});
			}
		});

		ExperienceSocket.on<ISocketUserData>(SocketEvent.PLAYER_JOINED, (data) => {
			console.log('Player joined', data);

			if (data.id === this.userId) {
				// Add current player
				this.activeScene?.addCurrentPlayer(data.username, parseInt(data.modelId));

				return;
			}

			// Add the visitor
			this.activeScene?.addVisitor(
				data.id,
				data.username,
				parseInt(data.modelId),
				new Vector3(...data.position),
				new Quaternion(...data.quaternion)
			);
		});

		ExperienceSocket.on<ISocketUserData>(SocketEvent.PLAYER_LEFT, (data) => {
			console.log('Player left', data);

			// Get player
			const player = data.id === this.userId ? this.activeScene?.currentPlayer : this.activeScene?.players[data.id];

			if (!player || !player.model) {
				return;
			}

			// Make sure all tweens are killed first
			gsap.killTweensOf(player.model.scale);

			// Remove current player from previous active scene
			gsap.to(player.model.scale, {
				x: 0,
				y: 0,
				z: 0,
				duration: 0.4,
				ease: 'back.inOut',
				onComplete: () => {
					if (data.id === this.userId) {
						// Remove active player from previous scene
						this.activeScene?.removeCurrentPlayer();

						return;
					}

					// Remove active player from previous scene
					this.activeScene?.removeVisitor(data.id);
				}
			});
		});

		ExperienceSocket.on<ISocketClientUpdatePlayerData>(SocketEvent.CLIENT_UPDATE_PLAYER, (data) => {
			// Update player in target scene
			if (this.activeScene && this.activeScene.players && this.activeScene.sceneKey === data.sceneKey) {
				// Update the mixer of the visitor player
				this.activeScene.players[data.visitorId]?.mixer?.update(data.delta);

				// Update the controls of the visitor player
				this.activeScene.players[data.visitorId]?.controls?.update(data.delta, data.keysPressed);
			}
		});

		ExperienceSocket.on<ISocketMessageData>(SocketEvent.SEND_MESSAGE, (data) => {
			console.log('New message received!', data);

			// Set ref
			this.incomingVisitorMessageData.value = data;
		});

		ExperienceSocket.on<ISocketTriggerEmoteData>(SocketEvent.TRIGGER_EMOTE, (data) => {
			console.log('Emote triggered!', data);

			if (!this.activeScene || !this.activeScene.currentPlayer || !this.activeScene.currentPlayer.controls) {
				return;
			}

			// Find target visitor
			const targetVisitor = this.activeScene.players[data.userId] ?? null;

			if (!targetVisitor) {
				console.warn('Target player not found when trying to trigger emote...');
				return;
			}

			if (!targetVisitor.controls) {
				return;
			}

			// Set emote animation name
			targetVisitor.controls.playAnimation(data.animationName);
		});
	}
	setActiveScene(key: SceneKey): void {
		// Check if the scene exists
		if (!this.scenes.has(key)) {
			console.warn(`Scene "${key}" not found.`);
			return;
		}

		if (this.activeScene && this.activeScene.sceneKey === key) {
			return;
		}

		if (this.activeScene && this.activeScene.currentPlayer && this.activeScene.currentPlayer.model) {
			// Make sure all tweens are killed first
			gsap.killTweensOf(this.activeScene.currentPlayer.model.scale);

			// First remove current player from previous active scene
			gsap.to(this.activeScene.currentPlayer.model.scale, {
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
						username: this.username,
						modelId: this.modelId,
						sceneKey: key,
						spawnPosition: this.activeScene?.currentPlayer?.model?.position ?? new Vector3(),
						spawnRotation: this.activeScene?.currentPlayer?.model?.quaternion ?? new Quaternion()
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
			username: this.username,
			modelId: this.modelId,
			sceneKey: key,
			spawnPosition: this.activeScene?.currentPlayer?.model?.position ?? new Vector3(),
			spawnRotation: this.activeScene?.currentPlayer?.model?.quaternion ?? new Quaternion()
		});
	}

	private addEventListeners() {
		window.addEventListener('resize', () => this.resize());

		if (this.canvas) {
			this.canvas.addEventListener('pointermove', (event: PointerEvent) => this.onPointerMove(event));
			this.canvas.addEventListener('click', () => this.checkIntersectingPlayer());
		}
	}

	private removeEventListeners() {
		window.removeEventListener('resize', () => this.resize());

		if (this.canvas) {
			this.canvas.removeEventListener('pointermove', (event: PointerEvent) => this.onPointerMove(event));
			this.canvas.removeEventListener('click', () => this.checkIntersectingPlayer());
		}
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

		// Set raycaster near/far limits
		this.raycaster.near = 1;
		this.raycaster.far = 1000;

		// Update the picking ray with the camera and pointer position
		this.raycaster.setFromCamera(this.pointer, this.activeScene.camera);

		// Calculate objects intersecting the picking ray
		const intersects = this.raycaster.intersectObjects(this.activeScene.scene.children, true);

		// Find the first intersected object that belongs to an player
		const playerIntersect = intersects.find((intersect) => {
			let obj: IExtendedObject3D = intersect.object;

			// Traverse up the parent hierarchy to find the player root
			while (obj) {
				if (obj.isPlayer || obj.isNpc) {
					return true;
				}
				obj = obj.parent as Object3D;
			}
			return false;
		});

		if (playerIntersect) {
			// Get the actual player root object
			let characterRoot: IExtendedObject3D = playerIntersect.object;
			while (characterRoot && !(characterRoot.isPlayer || characterRoot.isNpc)) {
				characterRoot = characterRoot.parent as Object3D;
			}

			if (
				this.activeScene &&
				this.activeScene.players &&
				Object.values(this.activeScene.players).length > 0 &&
				characterRoot
			) {
				const hoveredPlayerEntry = Object.entries(this.activeScene?.players ?? {}).find(
					([_, player]) => player.model?.uuid === characterRoot.uuid && !player.isCurrent
				);

				this.hoveredNpc =
					Object.values(this.activeScene?.npcs ?? {}).find((npc) => npc.model?.uuid === characterRoot.uuid) ?? null;

				let hoveredPlayerSocketId = null;
				if (hoveredPlayerEntry && hoveredPlayerEntry.length > 0) {
					hoveredPlayerSocketId = hoveredPlayerEntry[0] ?? null;
					this.hoveredPlayer = hoveredPlayerEntry[1] ?? null;
				}

				if (
					((this.hoveredPlayer && this.userId !== hoveredPlayerSocketId) || this.hoveredNpc) &&
					!document.body.classList.contains('cursor-pointer')
				) {
					document.body.classList.add('cursor-pointer');
				}
			}

			return;
		}

		// Make sure to remove cursor class
		document.body.classList.remove('cursor-pointer');

		// Reset hovered adn selected player when not hovering anymore
		this.hoveredPlayer = null;
	}

	public fetchOrLoadModelCacheEntry(
		modelPrefix: ModelPrefix,
		modelId: number,
		spawnPosition: Vector3,
		spawnRotation: Quaternion
	): Promise<IModelCacheEntry> {
		return new Promise(async (resolve, reject) => {
			if (this.modelCache.has(`${modelPrefix}-${modelId}`)) {
				// Reuse existing model
				const cachedGltf = this.modelCache.get(`${modelPrefix}-${modelId}`)!;

				// Set spawn position and rotation
				cachedGltf.model.position.copy(spawnPosition);
				cachedGltf.model.quaternion.copy(spawnRotation);

				// Resolve
				resolve({ model: cachedGltf.model, animations: cachedGltf.animations });

				return;
			}

			try {
				// Load model for first time
				const gltf = await ThreeLoaders.loadGLTF(`/assets/models/${modelPrefix}/${modelId}/scene.gltf`);
				const model: IExtendedObject3D = gltf.scene;

				// Do adjustments
				if (modelPrefix === ModelPrefix.PLAYER) model.isPlayer = true;
				if (modelPrefix === ModelPrefix.NPC) model.isNpc = true;
				model.position.copy(spawnPosition);
				model.quaternion.copy(spawnRotation);
				model.castShadow = true;
				model.receiveShadow = true;

				// Store in cache
				this.modelCache.set(`${modelPrefix}-${modelId}`, {
					model: model,
					animations: gltf.animations
				});

				// Resolve
				resolve({ model: model, animations: gltf.animations });
			} catch (error) {
				console.error(error);
				reject(new Error('Error loading player model'));
			}
		});
	}

	private animate(): void {
		// Get delta time
		const delta = this.clock.getDelta();

		if (this.activeScene && this.renderer) {
			// Begin stats
			this.stats.begin();

			// Update the active scene
			this.activeScene.update(delta);

			if (this.needsRaycast) {
				// Handle raycaster
				this.handleRaycaster();

				// Set needs raycast
				this.needsRaycast = false;
			}

			// Render the renderer
			this.renderer.render(this.activeScene.scene, this.activeScene.camera);

			// End stats
			this.stats.end();
		}

		// Request new frame
		this.animateFrameId = requestAnimationFrame(this.animate.bind(this));
	}

	private updateSceneCamerasAndRenderSize() {
		this.scenes.forEach((scene) => {
			// Update camera of all scenes
			scene.camera.aspect = window.innerWidth / window.innerHeight;
			scene.camera.updateProjectionMatrix();
		});

		if (this.renderer) {
			// Set canvas size again
			this.renderer.setSize(window.innerWidth, window.innerHeight);
		}
	}

	resize(): void {
		this.updateSceneCamerasAndRenderSize();
	}

	onPointerMove(event: PointerEvent) {
		if (!this.pointer) {
			this.pointer = new Vector2();
		}

		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components

		this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

		// Set needs raycast
		this.needsRaycast = true;
	}

	checkIntersectingPlayer() {
		if (!this.selectedPlayer.value && this.hoveredPlayer) {
			// Set ref so popup modal opens
			this.selectedPlayer.value = this.hoveredPlayer;
		}

		if (this.hoveredNpc) {
			// Play talking animation
			this.hoveredNpc.startDialog();
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

		if (this.renderer) {
			// Dispose of the renderer
			this.renderer.dispose();
		}
	}

	setInteractiveState(value: boolean) {
		this.isInteractive = value;
	}
}
