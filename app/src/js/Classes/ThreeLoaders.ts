import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export class ThreeLoaders {
	private static textureLoader: TextureLoader = new TextureLoader();
	private static gltfLoader: GLTFLoader = new GLTFLoader();
	private static dracoLoader: DRACOLoader = new DRACOLoader();

	// Initialize DRACO only once when the class is first used
	static {
		this.dracoLoader.setDecoderPath('/draco/');
		this.gltfLoader.setDRACOLoader(this.dracoLoader);
	}

	static loadGLTF(url: string): Promise<THREE.Group> {
		return new Promise((resolve, reject) => {
			this.gltfLoader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
		});
	}

	static loadTexture(url: string): Promise<THREE.Texture> {
		return new Promise((resolve, reject) => {
			this.textureLoader.load(url, resolve, undefined, reject);
		});
	}
}