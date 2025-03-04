import { AnimationClip } from 'three';
import { IExtendedObject3D } from './IExtendedObject3D.ts';

export interface IModelCacheEntry {
	model: IExtendedObject3D;
	animations: AnimationClip[];
}
