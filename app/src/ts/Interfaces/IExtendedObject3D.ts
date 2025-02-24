import { Object3D } from 'three';

export interface IExtendedObject3D extends Object3D {
    isAvatar?: boolean;
}