import { IParticle } from '../Interfaces/IParticle.ts';
import { ThreeLoaders } from './ThreeLoaders.ts';
import { ILinearSpline } from '../Interfaces/ILinearSpline.ts';
import { IParticleSystem } from '../Interfaces/IParticleSystem.ts';
import {
	Vector3,
	Color,
	BufferGeometry,
	ShaderMaterial,
	Points,
	Camera,
	Object3D,
	AdditiveBlending,
	Float32BufferAttribute,
	Texture
} from 'three';
import vertexShader from '../Shaders/ParticleSystem/vertexShader.glsl';
import fragmentShader from '../Shaders/ParticleSystem/fragmentShader.glsl';

export default class ParticleSystem implements IParticleSystem {
	private particles: IParticle[] = [];
	private geometry: BufferGeometry | null = null;
	private material: ShaderMaterial | null = null;
	private points: Points | null = null;
	private alphaSpline: ILinearSpline<number> | null = null;
	private colorSpline: ILinearSpline<Color> | null = null;
	private sizeSpline: ILinearSpline<number> | null = null;
	private timeAccumulator: number = 0.0;
	public isAlive: boolean = false;

	constructor(
		public params: {
			camera: Camera;
			emitPosition: Vector3;
			parent: Object3D;
			rate: number;
			texture: string;
		}
	) {
		// Load texture and create the particle system
		ThreeLoaders.loadTexture(this.params.texture).then((texture: Texture) => {
			this.initializeParticleSystem(texture);
			this.initializeSplines();
			this.updateGeometry();
		});
	}

	/**
	 * Initializes and configures the particle system with a given texture.
	 * @param texture The texture used for the particles.
	 */
	private initializeParticleSystem(texture: Texture): void {
		// Create and configure geometry and material for the particle system
		this.geometry = new BufferGeometry();
		this.material = new ShaderMaterial({
			uniforms: {
				diffuseTexture: { value: texture },
				pointMultiplier: {
					value: window.innerHeight / (2.0 * Math.tan((30.0 * Math.PI) / 180.0))
				}
			},
			vertexShader,
			fragmentShader,
			blending: AdditiveBlending,
			depthTest: true,
			depthWrite: false,
			transparent: true,
			vertexColors: true
		});

		this.points = new Points(this.geometry, this.material);
		this.points.frustumCulled = false;
		this.params.parent.add(this.points);
	}

	/**
	 * Initializes the splines for particle properties like alpha, color, and size.
	 */
	private initializeSplines(): void {
		// Alpha spline
		this.alphaSpline = this.getLinearSpline((t: number, a: number, b: number) => a + t * (b - a));
		this.alphaSpline.addPoint(0.0, 0.0);
		this.alphaSpline.addPoint(0.6, 1.0);
		this.alphaSpline.addPoint(1.0, 0.0);

		// Color spline
		this.colorSpline = this.getLinearSpline((t: number, a: Color, b: Color) => a.clone().lerp(b, t));
		this.colorSpline.addPoint(0.0, new Color(0xffffff));
		this.colorSpline.addPoint(1.0, new Color(0xff8080));

		// Size spline
		this.sizeSpline = this.getLinearSpline((t: number, a: number, b: number) => a + t * (b - a));
		this.sizeSpline.addPoint(0.0, 0.0);
		this.sizeSpline.addPoint(1.0, 1.0);
	}

	/**
	 * Creates a linear spline for interpolation.
	 * @param lerp The interpolation function to use.
	 * @returns A new LinearSpline object.
	 */
	private getLinearSpline<T>(lerp: (t: number, a: T, b: T) => T): ILinearSpline<T> {
		const points: [number, T][] = [];
		return {
			addPoint(t: number, d: T): void {
				points.push([t, d]);
			},
			getValueAt(t: number): T {
				let p1 = 0;
				for (let i = 0; i < points.length; i++) {
					if (points[i]![0] >= t) break;
					p1 = i;
				}
				const p2 = Math.min(points.length - 1, p1 + 1);
				if (p1 === p2) return points[p1]![1];
				return lerp((t - points[p1]![0]) / (points[p2]![0] - points[p1]![0]), points[p1]![1], points[p2]![1]);
			}
		};
	}

	/**
	 * Adds new particles to the system based on the time elapsed.
	 * @param timeElapsed The time elapsed since the last update.
	 */
	private addParticles(timeElapsed: number): void {
		this.timeAccumulator += timeElapsed;
		const n = Math.floor(this.timeAccumulator * this.params.rate);
		this.timeAccumulator -= n / this.params.rate;

		const emitPosition = this.params.emitPosition; // Directly use the emission position here

		for (let i = 0; i < n; i++) {
			const life = (Math.random() * 0.75 + 0.25) * 1.5;
			this.particles.push({
				position: new Vector3(
					(Math.random() * 2 - 1) * 0.2,
					(Math.random() * 2 - 1) * 0.2,
					(Math.random() * 2 - 1) * 0.2
				).add(emitPosition), // Add the emit position here
				size: (Math.random() * 0.5 + 0.5) * 3.0,
				colour: new Color(),
				alpha: 1.0,
				life: life,
				maxLife: life,
				rotation: Math.random() * 2.0 * Math.PI,
				rotationRate: Math.random() * 0.01 - 0.005,
				velocity: new Vector3(0, 1.5, 0),
				currentSize: 0.0
			});
		}
	}

	/**
	 * Updates the geometry of the particle system.
	 */
	private updateGeometry(): void {
		const positions: number[] = [];
		const sizes: number[] = [];
		const colours: number[] = [];
		const angles: number[] = [];

		for (const p of this.particles) {
			positions.push(p.position.x, p.position.y, p.position.z);
			colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
			sizes.push(p.currentSize);
			angles.push(p.rotation);
		}

		this.geometry!.setAttribute('position', new Float32BufferAttribute(positions, 3));
		this.geometry!.setAttribute('size', new Float32BufferAttribute(sizes, 1));
		this.geometry!.setAttribute('aColor', new Float32BufferAttribute(colours, 4));
		this.geometry!.setAttribute('angle', new Float32BufferAttribute(angles, 1));

		this.geometry!.attributes!['position']!.needsUpdate = true;
		this.geometry!.attributes!['size']!.needsUpdate = true;
		this.geometry!.attributes!['aColor']!.needsUpdate = true;
		this.geometry!.attributes!['angle']!.needsUpdate = true;
	}

	/**
	 * Updates the properties of the particles based on the time elapsed.
	 * @param timeElapsed The time elapsed since the last update.
	 */
	private updateParticles(timeElapsed: number): void {
		for (const p of this.particles) {
			p.life -= timeElapsed;
		}

		this.particles = this.particles.filter((p) => p.life > 0.0);

		const parentPosition = this.params.parent.position; // Get the current position of the parent

		for (const p of this.particles) {
			const t = 1.0 - p.life / p.maxLife;
			p.rotation += p.rotationRate;
			p.alpha = this.alphaSpline!.getValueAt(t);
			p.currentSize = p.size * this.sizeSpline!.getValueAt(t);
			p.colour.copy(this.colorSpline!.getValueAt(t));
			p.position.add(p.velocity.clone().multiplyScalar(timeElapsed));

			// Apply the parent position to the particle's position to follow the parent
			p.position.add(parentPosition);

			const drag = p.velocity.clone().multiplyScalar(timeElapsed * 0.1);
			drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
			drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
			drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
			p.velocity.sub(drag);
		}

		this.particles.sort((a, b) => {
			const d1 = this.params.camera.position.distanceTo(a.position);
			const d2 = this.params.camera.position.distanceTo(b.position);
			return d1 > d2 ? -1 : d1 < d2 ? 1 : 0;
		});
	}

	/**
	 * Main update loop for the particle system.
	 * @param timeElapsed The time elapsed since the last update.
	 */
	public update(timeElapsed: number): void {
		if (this.isAlive) {
			// Add new particles
			this.addParticles(timeElapsed);
		}

		// Update the particles
		this.updateParticles(timeElapsed);

		// Update the geometry
		this.updateGeometry();
	}
}
