import { gsap } from 'gsap';
import { IPlayer } from '../Interfaces/IPlayer.ts';
import { SceneKey } from '../Enums/SceneKey.ts';
import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { SocketEvent } from '../Enums/SocketEvent.ts';
import { ISceneSettings } from '../Interfaces/ISceneSettings.ts';
import { ExperienceSocket } from './ExperienceSocket.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import {
	AmbientLight,
	Color,
	DirectionalLight,
	Fog,
	HemisphereLight,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	OrthographicCamera,
	PlaneGeometry,
	Quaternion,
	Scene,
	Vector3
} from 'three';
import ExperienceCamera from './ExperienceCamera.ts';
import Player from './Player.ts';
import ExperienceManager from './ExperienceManager.ts';
import Npc from './Npc.ts';

export default class ExperienceScene implements IExperienceScene {
	public readonly scene: Scene;
	public sceneKey: SceneKey;
	public settings: ISceneSettings;
	public readonly camera: ExperienceCamera;
	public cameraParent: Object3D;
	public updateAction: ((delta: number) => void) | null;
	public players: { [key: string]: Player } = {};
	public npcs: Array<Npc> = [];

	constructor(canvas: HTMLCanvasElement, sceneKey: SceneKey, settings: ISceneSettings = { floorColor: 'Blue' }) {
		this.scene = new Scene();
		this.sceneKey = sceneKey;
		this.settings = settings;
		this.camera = new ExperienceCamera(this.scene, canvas);
		this.cameraParent = new Object3D();
		this.updateAction = null;

		// Setup camera parent
		this.cameraParent.rotation.order = 'YXZ';
		this.cameraParent.rotation.x = -0.3;

		// Add paren to scene
		this.scene.add(this.cameraParent);

		// Add camera to parent object
		this.cameraParent.add(this.camera);

		// Scene fog
		this.scene.fog = new Fog(0xffffff, 5, 15);

		// Setup lighting
		this.setupLighting();

		// Setup floor
		this.setupFloor();
	}

	public get currentPlayer() {
		if (Object.values(this.players).length === 0) {
			return;
		}

		return Object.values(this.players).find((player: IPlayer) => player.isCurrent);
	}

	public setupFloor(): void {
		// Create a large plane
		const geometry = new PlaneGeometry(500, 500, 10, 10);

		// Create material with all maps
		const material = new MeshStandardMaterial({
			color: new Color(this.settings.floorColor)
		});

		// Create plane
		const plane = new Mesh(geometry, material);

		// Setup shadows
		plane.castShadow = true;
		plane.receiveShadow = true;

		// Rotate the plane to lay flat (XZ plane)
		plane.rotation.x = -Math.PI / 2;
		this.scene.add(plane);
	}

	private setupLighting(): void {
		// Add ambient light
		const ambientLight = new AmbientLight(0xffffff, 3);
		this.scene.add(ambientLight);

		// Add hemisphere light
		const hemiLight = new HemisphereLight(0xffffff, 0x444444, 1);
		hemiLight.position.set(0, 20, 0);
		this.scene.add(hemiLight);

		// Add directional light
		const dirLight = new DirectionalLight(0xffffff, 2);
		dirLight.position.set(-3, 10, -10);
		dirLight.castShadow = true;
		dirLight.shadow.camera = new OrthographicCamera(-10, 10, 10, -10, 1, 1000);
		dirLight.shadow.mapSize.set(4096, 4096);
		this.scene.add(dirLight);
	}

	public addNpc(
		username: string,
		modelId: number,
		spawnPosition: Vector3 = new Vector3(),
		spawnRotation: Quaternion = new Quaternion()
	): void {
		// Create NPC with the computed quaternion
		const npc = new Npc(username, ModelPrefix.NPC, modelId, this, this.camera, spawnPosition, spawnRotation);

		// Add NPC to the list
		this.npcs.push(npc);
	}

	public addCurrentPlayer(username: string, modelId: number) {
		if (this.currentPlayer) {
			return;
		}

		// Create current player and add to players object
		this.players[ExperienceManager.instance.userId!] = new Player(
			username,
			ModelPrefix.PLAYER,
			modelId,
			this,
			this.camera,
			true
		);
	}

	public removeCurrentPlayer() {
		if (!this.currentPlayer) {
			return;
		}

		// Destroy the current player
		this.currentPlayer.destroy();

		// Remove from players list
		delete this.players[ExperienceManager.instance.userId!];
	}

	public addVisitor(
		userId: string,
		username: string,
		modelId: number,
		spawnPosition: Vector3 = new Vector3(),
		spawnRotation: Quaternion = new Quaternion()
	) {
		// Create and add visitor to visitors list
		this.players[userId] = new Player(
			username,
			ModelPrefix.PLAYER,
			modelId,
			this,
			this.camera,
			false,
			spawnPosition,
			spawnRotation
		);
	}

	public removeVisitor(userId: string) {
		// Get the target visitor player
		const targetVisitor = this.players[userId];

		if (!targetVisitor || !targetVisitor.model) {
			return;
		}

		// Make sure all tweens are killed first
		gsap.killTweensOf(targetVisitor.model.scale);

		// Animate in character
		gsap.to(targetVisitor.model.scale, {
			x: 0,
			y: 0,
			z: 0,
			ease: 'back.out',
			duration: 1,
			onComplete: () => {
				// Call destroy function
				targetVisitor.destroy();

				// Delete from visitors object
				delete this.players[userId];
			}
		});
	}

	public update(delta: number): void {
		if (this.currentPlayer && this.currentPlayer.controls && this.currentPlayer.model) {
			// Update the current player
			this.currentPlayer.update(delta);

			// Send data to socket server for sync
			ExperienceSocket.emit(SocketEvent.CLIENT_UPDATE_PLAYER, {
				visitorId: ExperienceManager.instance.userId,
				delta: delta,
				keysPressed: ExperienceManager.instance.isInteractive ? this.currentPlayer.controls.keysPressed : {},
				sceneKey: this.sceneKey,
				spawnPosition: this.currentPlayer.model.position.toArray(),
				spawnRotation: this.currentPlayer.model.quaternion.toArray()
			});
		}

		// Update npc characters
		this.npcs.forEach((npc) => npc.update(delta));
	}

	public destroy(): void {
		// Dispose any resources tied to the scene
	}
}
