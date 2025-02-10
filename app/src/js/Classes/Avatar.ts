import { IAvatar } from '../Interfaces/IAvatar.ts';
import { Mesh, Object3D, Scene } from 'three';
import { ThreeLoaders } from './ThreeLoaders.ts';

export default class Avatar extends Mesh implements IAvatar {
	public scene: Scene;
	public model: Object3D | null = null;

	constructor(scene: Scene) {
		super();

		this.scene = scene;

		// Initiate avatar
		this.init();
	}

	async init() {
		// Load model
		await this.load();
	}

	async load() {
		try {
			this.model = await ThreeLoaders.loadGLTF('/assets/models/avatar/avatar.gltf');
		} catch (error) {
			throw new Error(error);
		}

		// Add avatar to scene
		this.scene.add(this.model);
	}
}