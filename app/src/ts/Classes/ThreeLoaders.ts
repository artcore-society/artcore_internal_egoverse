import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Mesh, Object3D } from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';

export class ThreeLoaders {
	private static textureLoader: TextureLoader = new TextureLoader();
	private static exrLoader: EXRLoader = new EXRLoader();
	private static gltfLoader: GLTFLoader = new GLTFLoader();
	private static dracoLoader: DRACOLoader = new DRACOLoader();

	// Initialize DRACO only once when the class is first used
	static {
		this.dracoLoader.setDecoderPath('/draco/');
		this.gltfLoader.setDRACOLoader(this.dracoLoader);
	}

	static loadGLTF(url: string): Promise<GLTF> {
		return new Promise((resolve, reject) => {
			this.gltfLoader.load(url, (gltf) => {
				const model = gltf.scene;

				// Cast shadow when necessary
				model.traverse((item: Object3D) => {
					const mesh = item as Mesh;
					if (mesh.isMesh) {
						mesh.receiveShadow = true;
						mesh.castShadow = true;
					}
				});


				// Resolve the model
				resolve(gltf);
			}, undefined, reject);
		});
	}

	static loadTexture(url: string): Promise<THREE.Texture> {
		return new Promise((resolve, reject) => {
			this.textureLoader.load(url, resolve, undefined, reject);
		});
	}

	static loadExr(url: string): Promise<THREE.Texture> {
		return new Promise((resolve, reject) => {
			this.exrLoader.load(url, resolve, undefined, reject);
		});
	}
}