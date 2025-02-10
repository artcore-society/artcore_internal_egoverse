import { IExperienceScene } from '../Interfaces/IExperienceScene';
import ExperienceScene from './ExperienceScene';

export class ChatRoomScene extends ExperienceScene implements IExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);
		// Custom initialization for the landing area
	}

	override update(delta: number): void {
		console.log('Updating Landing Area Scene', delta);
		// Add any scene-specific update logic here
	}
}