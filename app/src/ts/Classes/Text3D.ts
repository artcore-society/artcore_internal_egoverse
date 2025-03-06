import { Font } from 'three/examples/jsm/loaders/FontLoader';
import { Mesh, MeshBasicMaterial, ShapeGeometry, DoubleSide, Color } from 'three';
import { ThreeLoaders } from './ThreeLoaders.ts';

export default class Text3D extends Mesh {
	private static fontCache = new Map<string, Font>();

	constructor(text: string, font: Font, size: number = 0.1, color: number | Color = 0x006699) {
		if (!text.trim()) {
			throw new Error('Text cannot be empty');
		}

		// Create material
		const material = new MeshBasicMaterial({
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

		super(geometry, material);
	}

	private static async getFont(fontUrl: string): Promise<Font> {
		if (this.fontCache.has(fontUrl)) {
			// Return cached font
			return this.fontCache.get(fontUrl)!;
		}

		// Load the font
		const font: Font = await ThreeLoaders.loadFont(fontUrl);

		// Store font in cache
		this.fontCache.set(fontUrl, font);

		// Return the font
		return font;
	}

	static async create(
		text: string,
		fontUrl: string,
		size: number = 0.1,
		color: number | Color = 0x006699
	): Promise<Text3D> {
		// Get the font
		const font = await this.getFont(fontUrl);

		// Return 3D text
		return new Text3D(text, font, size, color);
	}
}
