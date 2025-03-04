import ExperienceCamera from '../Classes/ExperienceCamera.ts';
import PlayerControls from '../Classes/PlayerControls.ts';

export interface IPlayer {
	camera: ExperienceCamera;
	isCurrent: boolean;
	controls: PlayerControls | null;
}
