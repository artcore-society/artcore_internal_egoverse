import { Quaternion as ThreeQuaternion } from 'three';
import { Quaternion as CannonQuaternion } from 'cannon-es';

export function lerp(value1: number, value2: number, amount: number): number {
	// Set amount
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;

	return value1 + (value2 - value1) * amount;
}

export function clampNumber(num: number, a: number, b: number): number {
	return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
}

export function wait(seconds: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function copyQuaternionToCannon(threeQuaternion: ThreeQuaternion): CannonQuaternion {
	return new CannonQuaternion(threeQuaternion.x, threeQuaternion.y, threeQuaternion.z, threeQuaternion.w);
}
