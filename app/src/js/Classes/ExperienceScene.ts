import { AvatarType } from '../Enums/AvatarType.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import {
	AmbientLight,
	Color,
	DirectionalLight,
	Fog,
	HemisphereLight,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	OrthographicCamera,
	PlaneGeometry,
	Scene
} from 'three';
import ExperienceCamera from './ExperienceCamera.ts';
import Avatar from './Avatar.ts';
import { ExperienceSocket } from './ExperienceSocket.ts';
import { SocketEvent } from '../Enums/SocketEvent.ts';
import ExperienceManager from './ExperienceManager.ts';
import { SceneKey } from '../Enums/SceneKey.ts';

export default abstract class ExperienceScene implements IExperienceScene {
	public readonly scene: Scene;
	public sceneKey: SceneKey;
	public readonly camera: ExperienceCamera;
	public cameraParent: Object3D;
	public updateAction: ((delta: number) => void) | null;
	public playerAvatar: Avatar | null = null;
	public visitorAvatars: { [key: string]: Avatar } = {};

	protected constructor(canvas: HTMLCanvasElement, sceneKey: SceneKey) {
		this.scene = new Scene();
		this.sceneKey = sceneKey;
		this.camera = new ExperienceCamera(this.scene, canvas);
		this.cameraParent = new Object3D();
		this.updateAction = null;

		// Set current player
		this.playerAvatar = new Avatar(this, this.camera, AvatarType.CURRENT_PLAYER);

		// Setup camera parent
		this.cameraParent.rotation.order = 'YXZ';
		this.cameraParent.rotation.x = -0.3;

		// Add paren to scene
		this.scene.add(this.cameraParent);

		// Add camera to parent object
		this.cameraParent.add(this.camera);

		// Set render action
		this.setUpdateAction((delta) => {
			if(this.playerAvatar) {
				// Update avatar
				this.playerAvatar.update(delta);

				// Send data to socket server for sync
				ExperienceSocket.emit(SocketEvent.CLIENT_UPDATE_PLAYER, {
					id: ExperienceManager.instance.userId,
					delta: delta,
					keysPressed: this.playerAvatar?.controls?.keysPressed,
					sceneKey: this.sceneKey
				});
			}
		});

		// Set scene fog
		this.scene.fog = new Fog( 0xffffff, 15, 50 );

		// Setup lighting
		this.setupLighting();
	}

	abstract init(): void

	public setupFloor(color: string): void {
		// Create a large plane
		const geometry = new PlaneGeometry(500, 500, 10, 10);

		// Create material with all maps
		const material = new MeshBasicMaterial({ color: new Color(color ?? 'blue') });

		// Create plane
		const plane = new Mesh(geometry, material);

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

	public addVisitor(userId: string) {
		// Create and add avatar of visitor to visitors list
		this.visitorAvatars[userId] = new Avatar(this, this.camera, AvatarType.VISITOR);
	}

	public removeVisitor(userId: string) {
		// Get the target visitor avatar
		const targetVisitor = this.visitorAvatars[userId];

		if(!targetVisitor) {
			return;
		}

		// Call destroy function
		targetVisitor.destroy();

		// Delete from visitors object
		delete this.visitorAvatars[userId];
	}

	private setUpdateAction(callback: (delta: number) => void): void {
		this.updateAction = callback;
	}

	public update(delta: number): void {
		if (this.updateAction) {
			// Call render action if not paused
			this.updateAction(delta);
		}
	}

	public destroy(): void {
		// Dispose any resources tied to the scene
	}
}