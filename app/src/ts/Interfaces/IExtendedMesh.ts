import { Mesh } from 'three';

export interface IExtendedMesh extends Mesh {
	isPlayer?: boolean;
}
