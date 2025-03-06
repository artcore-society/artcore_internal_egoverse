import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { Mesh, MeshBasicMaterial, ShapeGeometry, DoubleSide } from 'three';

export default class Text3D {
	static async createText(text: string, fontUrl: string, size: number = 0.1, color: number = 0x006699): Promise<Mesh> {
		// Load font
		const loader = new FontLoader();
		const font: Font = await new Promise((resolve, reject) => {
			loader.load(fontUrl, resolve, undefined, reject);
		});

		// Create material
		const matLite = new MeshBasicMaterial({
			color,
			transparent: true,
			opacity: 1,
			side: DoubleSide
		});

		// Create font shapes and geometry
		const shapes = font.generateShapes(text, size);
		const geometry = new ShapeGeometry(shapes);
		geometry.computeBoundingBox();

		if (geometry.boundingBox) {
			const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
			geometry.translate(xMid, 0, 0);
		}

		// Create mesh
		return new Mesh(geometry, matLite);
	}
}
