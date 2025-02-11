import { AvatarType } from '../Enums/AvatarType.ts';
import { IAvatarLobby } from '../Interfaces/IAvatarLobby.ts';
import { IThreeScene } from '../Interfaces/IThreeScene.ts';
import {
	AmbientLight,
	DirectionalLight, Fog,
	HemisphereLight,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	OrthographicCamera,
	PlaneGeometry,
	RepeatWrapping,
	Scene
} from 'three';
import ExperienceCamera from './ExperienceCamera.ts';
import Avatar from './Avatar.ts';
import { ThreeLoaders } from './ThreeLoaders.ts';

export default abstract class ExperienceScene implements IThreeScene, IAvatarLobby {
	public readonly scene: Scene;
	public readonly camera: ExperienceCamera;
	public cameraParent: Object3D;
	public updateAction: ((delta: number) => void) | null;
	public playerAvatar: Avatar | null = null;
	public visitorAvatars: Avatar[] | null = null;

	protected constructor(canvas: HTMLCanvasElement) {
		this.scene = new Scene();
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
			}
		});

		// Set scene fog
		this.scene.fog = new Fog( 0xffffff, 15, 50 );

		// Setup lighting
		this.setupLighting();
	}

	abstract init(): void

	public async setupFloor(diffusePath: string, normalPath: string, roughnessPath: string, displacementPath: string): Promise<void> {
		// Create a large plane
		const geometry = new PlaneGeometry(500, 500, 10, 10);

		const diffuseMap = await ThreeLoaders.loadTexture(diffusePath);
		const normalMap = await ThreeLoaders.loadExr(normalPath);
		const roughnessMap = await ThreeLoaders.loadExr(roughnessPath);
		const displacementMap = await ThreeLoaders.loadTexture(displacementPath);

		// Enable texture repetition
		[diffuseMap, normalMap, roughnessMap, displacementMap].forEach(texture => {
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.repeat.set(250, 250);
		});

		// Create material with all maps
		const material = new MeshStandardMaterial({
			map: diffuseMap,
			normalMap: normalMap,
			roughnessMap: roughnessMap,
			displacementMap: displacementMap,
			displacementScale: 0,  // Adjust for realistic depth
			displacementBias: 0  // Fine-tune elevation
		});

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