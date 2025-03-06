import { Vector3 } from 'three';
import { CameraPov } from '../Enums/CameraPov.ts';

export interface ICameraPovOptions {
	type: CameraPov;
	position: Vector3;
}
