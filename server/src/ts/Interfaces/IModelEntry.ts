import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { IPhysicsObjectEntry } from './IPhysicsObjectEntry.ts';
import { Quaternion, Vector3 } from 'three';

export interface IModelEntry {
	modelPrefix: ModelPrefix;
	modelId: number;
	spawnScale: Vector3 | Array<number>;
	spawnPosition: Vector3 | Array<number>;
	spawnRotation: Quaternion | Array<number>;
	physicsObjects: Array<IPhysicsObjectEntry>;
}
