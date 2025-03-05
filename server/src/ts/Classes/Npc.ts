import { BaseCharacter } from './BaseCharacter.ts';
import { Quaternion, Vector3 } from 'three';

export class Npc extends BaseCharacter {
    constructor(
        username: string,
        modelId: number,
        sceneKey: string,
        spawnPosition: Vector3 = new Vector3(),
        spawnRotation: Quaternion = new Quaternion()
    ) {
        super(username, modelId, sceneKey, spawnPosition, spawnRotation);
    }
}
