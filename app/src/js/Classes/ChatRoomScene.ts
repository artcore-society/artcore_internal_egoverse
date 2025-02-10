import ExperienceScene from './ExperienceScene';

export class ChatRoomScene extends ExperienceScene {
	constructor(canvas: HTMLCanvasElement) {
		super(canvas);
		// Custom initialization for the landing area
	}

	update(delta: number): void {
		console.log('Updating Landing Area Scene', delta);
		// Add any scene-specific update logic here
	}
}