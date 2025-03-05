import { IPlayer } from '../Interfaces/IPlayer.ts';
import { SceneKey } from '../Enums/SceneKey.ts';
import { BaseCharacter } from './BaseCharacter.ts';
import { Quaternion, Vector3 } from 'three';

export class Player extends BaseCharacter implements IPlayer {
    public id: string;
    public sceneKey: SceneKey

    constructor(
        id: string,
        username: string,
        modelId: number,
        sceneKey: SceneKey,
        spawnPosition: Vector3 = new Vector3(),
        spawnRotation: Quaternion = new Quaternion()
    ) {
        super(username, modelId, spawnPosition, spawnRotation);

        this.id = id;
        this.sceneKey = sceneKey;
    }
}
