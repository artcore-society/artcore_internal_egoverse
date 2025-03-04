export interface ISocketSceneStateData {
	sceneKey: string;
	visitors: Array<{
		avatarId: string;
		id: string;
		username: string;
		position: Array<number>;
		quaternion: Array<number>;
	}>;
}
