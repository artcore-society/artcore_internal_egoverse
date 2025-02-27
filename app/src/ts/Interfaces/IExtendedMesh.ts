import { Mesh } from 'three';

export interface IExtendedMesh extends Mesh {
  isAvatar?: boolean;
}
