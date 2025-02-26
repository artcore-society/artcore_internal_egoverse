import { Sky } from 'three/examples/jsm/objects/Sky';
import { gsap } from 'gsap';
import { SceneKey } from '../Enums/SceneKey.ts';
import { AvatarType } from '../Enums/AvatarType.ts';
import { SocketEvent } from '../Enums/SocketEvent.ts';
import { ExperienceSocket } from './ExperienceSocket.ts';
import { IExperienceScene } from '../Interfaces/IExperienceScene.ts';
import {
	AmbientLight,
	Color,
	DirectionalLight,
	HemisphereLight,
	MathUtils,
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
import Avatar from './Avatar.ts';
import ExperienceManager from './ExperienceManager.ts';

export default abstract class ExperienceScene implements IExperienceScene {
	public readonly scene: Scene;
	public sceneKey: SceneKey;
	public readonly camera: ExperienceCamera;
	public cameraParent: Object3D;
	public updateAction: ((delta: number) => void) | null;
	public currentPlayerAvatar: Avatar | null = null;
	public visitorAvatars: { [key: string]: Avatar } = {};
	public sky: Sky = new Sky();

	protected constructor(canvas: HTMLCanvasElement, sceneKey: SceneKey) {
		this.scene = new Scene();
		this.sceneKey = sceneKey;
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

		// Setup lighting
		this.setupLighting();

		// Setup sky
		this.setupSky();
	}

	abstract init(): void

	public setupFloor(color: number): void {
		// Create a large plane
		const geometry = new PlaneGeometry(500, 500, 10, 10);

		// Create material with all maps
		const material = new MeshStandardMaterial({ color: new Color(color ?? 'blue') });

		// Create plane
		const plane = new Mesh(geometry, material);

		// Setup shadows
		// plane.castShadow = true;
		// plane.receiveShadow = true;

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

	private setupSky() {
		// Config the sky
		this.sky.scale.setScalar(1000);

		// Define effect controller
		const effectController = {
			turbidity: 3,
			rayleigh: 1,
			mieCoefficient: 0.005,
			mieDirectionalG: 0.7,
			elevation: 1,
			azimuth: 180,
		};

		// Set uniforms values
		const uniforms = this.sky.material.uniforms;
		uniforms['turbidity'].value = effectController.turbidity;
		uniforms['rayleigh'].value = effectController.rayleigh;
		uniforms['mieCoefficient'].value = effectController.mieCoefficient;
		uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

		// Calculate phi and theta for sun position
		const phi = MathUtils.degToRad( 90 - effectController.elevation );
		const theta = MathUtils.degToRad( effectController.azimuth );

		// Set sun position
		const sun = new Vector3();
		sun.setFromSphericalCoords( 1, phi, theta );
		uniforms['sunPosition'].value.copy( sun );

		// Add to scene
		this.scene.add(this.sky);
	}

	public addCurrentPlayer(username: string, selectedAvatarId: number) {
		if(this.currentPlayerAvatar) {
			return;
		}

		// Create current player avatar
		this.currentPlayerAvatar = new Avatar(username, selectedAvatarId, this, this.camera, AvatarType.CURRENT_PLAYER);
	}
	
	public removeCurrentPlayer() {
		if(!this.currentPlayerAvatar) {
			return;
		}

		// Destroy the current avatar
		this.currentPlayerAvatar.destroy();
		this.currentPlayerAvatar = null;
	}

	public addVisitor(userId: string, username: string, selectedAvatarId: number, spawnPosition: Vector3 = new Vector3(), spawnRotation: Quaternion = new Quaternion()) {
		// Create and add avatar of visitor to visitors list
		this.visitorAvatars[userId] = new Avatar(username, selectedAvatarId, this, this.camera, AvatarType.VISITOR, spawnPosition, spawnRotation);
	}

	public removeVisitor(userId: string) {
		// Get the target visitor avatar
		const targetVisitor = this.visitorAvatars[userId];

		if(!targetVisitor || !targetVisitor.model) {
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
				delete this.visitorAvatars[userId];
			}
		});
	}

	public update(delta: number): void {
		if(this.currentPlayerAvatar && this.currentPlayerAvatar.controls && this.currentPlayerAvatar.model) {
			// Update avatar
			this.currentPlayerAvatar.update(delta);

			// Send data to socket server for sync
			ExperienceSocket.emit(SocketEvent.CLIENT_UPDATE_PLAYER, {
				visitorId: ExperienceManager.instance.userId,
				delta: delta,
				keysPressed: ExperienceManager.instance.isInteractive ? this.currentPlayerAvatar.controls.keysPressed : {},
				sceneKey: this.sceneKey,
				spawnPosition: this.currentPlayerAvatar.model.position,
				spawnRotation: this.currentPlayerAvatar.model.rotation,
			});
		}
	}

	public destroy(): void {
		// Dispose any resources tied to the scene
	}
}