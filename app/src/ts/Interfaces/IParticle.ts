import { Color, Vector3 } from 'three';

export interface IParticle {
	position: Vector3;
	size: number;
	colour: Color;
	alpha: number;
	life: number;
	maxLife: number;
	rotation: number;
	rotationRate: number;
	velocity: Vector3;
	currentSize: number;
}
