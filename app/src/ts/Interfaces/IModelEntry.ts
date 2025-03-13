import { ModelPrefix } from '../Enums/ModelPrefix.ts';
import { IPhysicsObjectEntry } from './IPhysicsObjectEntry.ts';

export interface IModelEntry {
	modelPrefix: ModelPrefix;
	modelId: number;
	spawnScale: Array<number>;
	spawnPosition: Array<number>;
	spawnRotation: Array<number>;
	physicsObjects: Array<IPhysicsObjectEntry>;
}
