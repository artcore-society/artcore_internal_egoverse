import { Scene } from '../Classes/Scene.ts';

export class SceneService {
    private static scenes: Map<string, Scene> = new Map();

    static getOrCreateScene(sceneKey: string): Scene {
        if (!this.scenes.has(sceneKey)) {
            this.scenes.set(sceneKey, new Scene(sceneKey));
        }
        return this.scenes.get(sceneKey)!;
    }
}
