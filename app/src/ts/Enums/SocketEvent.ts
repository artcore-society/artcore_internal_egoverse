export enum SocketEvent {
	INIT = 'init',
	SCENE_STATE = 'scene-state',
	PLAYER_JOINED = 'player:joined',
	PLAYER_LEFT = 'player:left',
	CLIENT_UPDATE_PLAYER = 'client-update-player',
	JOIN_SCENE = 'join-scene',
	SEND_MESSAGE = 'send-message',
	TRIGGER_EMOTE = 'trigger-emote',
	FAILED = 'failed',
	CONNECTION = 'connection',
	DISCONNECT = 'disconnect'
}
