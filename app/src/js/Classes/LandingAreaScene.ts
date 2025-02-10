import { IExperienceScene } from '../Interfaces/IExperienceScene';
import ExperienceScene from './ExperienceScene';

export class LandingAreaScene extends ExperienceScene implements IExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);
		// Custom initialization for the landing area
	}

	update(delta: number): void {
		console.log('Updating Landing Area Scene');
	}
}