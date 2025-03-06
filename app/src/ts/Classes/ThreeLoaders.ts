import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { Mesh, Object3D, Texture } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export class ThreeLoaders {
	private static fontLoader: FontLoader = new FontLoader();
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
			this.gltfLoader.load(
				url,
				(gltf) => {
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
				},
				undefined,
				reject
			);
		});
	}

	static loadTexture(url: string): Promise<Texture> {
		return new Promise((resolve, reject) => {
			this.textureLoader.load(url, resolve, undefined, reject);
		});
	}

	static loadExr(url: string): Promise<Texture> {
		return new Promise((resolve, reject) => {
			this.exrLoader.load(url, resolve, undefined, reject);
		});
	}

	static loadFont(url: string): Promise<Font> {
		return new Promise((resolve, reject) => {
			this.fontLoader.load(url, resolve, undefined, reject);
		});
	}
}
