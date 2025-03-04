export interface ISocketSceneStateData {
	sceneKey: string;
	visitors: Array<{
		playerId: string;
		id: string;
		username: string;
		position: Array<number>;
		quaternion: Array<number>;
	}>;
}
