import { Scene } from '../Classes/Scene';
import { Player } from '../Classes/Player';
import { SceneKey } from '../Enums/SceneKey';
import { SocketEvent } from '../Enums/SocketEvent';
import { Server, Socket } from 'socket.io';
import { ISceneSettings } from '../Interfaces/ISceneSettings';

/**
 * Singleton class to manage game logic and WebSocket interactions.
 */
export class GameService {
    private static _instance: GameService;
    private io: Server;
    private scenes: Map<SceneKey, Scene> = new Map();
    private readonly MAX_PLAYERS = 100;

    /**
     * Private constructor to enforce singleton pattern.
     */
    private constructor(io: Server) {
        this.io = io;
        this.initScenes();
        this.setupSocketEvents();
    }

    /**
     * Ensures the GameService is initialized and returns the instance.
     */
    public static initialize(io: Server): GameService {
        if (!GameService._instance) {
            GameService._instance = new GameService(io);
        }
        return GameService._instance;
    }

    /**
     * Returns the existing instance of GameService.
     * Throws an error if called before initialization.
     */
    public static getInstance(): GameService {
        if (!GameService._instance) {
            throw new Error('GameService has not been initialized. Call GameService.initialize(io) first.');
        }
        return GameService._instance;
    }

    /**
     * Initializes game scenes with predefined settings.
     */
    private initScenes() {
        const scenesSettings: Map<SceneKey, ISceneSettings> = new Map();
        scenesSettings.set(SceneKey.LANDING_AREA, { color: 'Red' });
        scenesSettings.set(SceneKey.MEETING_ROOM, { color: 'Blue' });
        scenesSettings.set(SceneKey.CHAT_ROOM, { color: 'Green' });

        this.scenes = new Map(
            Object.values(SceneKey).map(key => [key as SceneKey, new Scene(key, scenesSettings.get(key))])
        );
    }

    /**
     * Sets up WebSocket event listeners for incoming connections.
     */
    private setupSocketEvents() {
        this.io.on(SocketEvent.CONNECTION, (socket) => this.handleConnection(socket));
    }

    /**
     * Handles a new player connection.
     * Validates input, creates a player, and assigns a scene.
     */
    private handleConnection(socket: Socket) {
        console.log(`New connection: ${socket.id}`);

        const username = this.sanitizeInput(socket.handshake.query.username as string);
        const avatarId = String(socket.handshake.query.selectedAvatarId) || '1';
        const sceneKey = this.sanitizeInput(socket.handshake.query.sceneKey) as SceneKey || SceneKey.LANDING_AREA;

        if (!username || !sceneKey) {
            socket.emit(SocketEvent.FAILED, { message: 'Invalid credentials' });
            socket.disconnect();
            return;
        }

        if (this.io.engine.clientsCount > this.MAX_PLAYERS) {
            socket.emit(SocketEvent.FAILED, { message: 'Server is full' });
            socket.disconnect();
            return;
        }

        const scene = this.scenes.get(sceneKey)!;
        const player = new Player(socket.id, username, avatarId, sceneKey, true);
        scene.addPlayer(player);
        socket.join(sceneKey);

        socket.emit(SocketEvent.INIT, {
            id: socket.id,
            currentSceneKey: sceneKey,
            scenes: Array.from(this.scenes.values()).map(scene => ({
                sceneKey: scene.sceneKey,
                settings: scene.settings,
            }))
        });

        this.io.to(sceneKey).emit(SocketEvent.PLAYER_JOINED, {
            id: player.id,
            username: player.username,
            avatarId: player.avatarId,
            position: player.position.toArray(),
            rotation: [player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w]
        });

        socket.on(SocketEvent.JOIN_SCENE, (data) => this.handleJoinScene(socket, player, data));
        socket.on(SocketEvent.CLIENT_UPDATE_PLAYER, (data) => this.handlePlayerUpdate(socket, player, data));
        socket.on(SocketEvent.SEND_MESSAGE, (data) => this.handleSendMessage(socket, data));
        socket.on(SocketEvent.TRIGGER_EMOTE, (data) => this.handleTriggerEmote(socket, data));
        socket.on(SocketEvent.DISCONNECT, () => this.handleDisconnect(socket, player));
    }

    /**
     * Handles a player switching to a different scene.
     */
    private handleJoinScene(socket: Socket, player: Player, data: any) {
        const newSceneKey = this.sanitizeInput(data.sceneKey) as SceneKey;
        if (!newSceneKey || !this.scenes.has(newSceneKey)) {
            socket.emit(SocketEvent.FAILED, { message: 'Invalid scene' });
            return;
        }

        if (player.sceneKey === newSceneKey) {
            socket.emit(SocketEvent.SCENE_STATE, this.scenes.get(player.sceneKey)!.getState(socket.id));
            return;
        }

        const oldSceneKey = player.sceneKey as SceneKey;
        if (this.scenes.has(oldSceneKey)) {
            const oldScene = this.scenes.get(oldSceneKey)!;
            oldScene.removePlayer(socket.id);
            socket.leave(oldSceneKey);
            this.io.to(oldSceneKey).emit(SocketEvent.PLAYER_LEFT, { id: socket.id });
        }

        const newScene = this.scenes.get(newSceneKey)!;
        newScene.addPlayer(player);
        socket.join(newSceneKey);
        player.sceneKey = newSceneKey;

        this.io.to(newSceneKey).emit(SocketEvent.PLAYER_JOINED, {
            id: player.id,
            username: player.username,
            avatarId: player.avatarId,
            position: player.position.toArray(),
            rotation: [player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w],
            sceneKey: newSceneKey
        });

        this.io.to(newSceneKey).emit(SocketEvent.SCENE_STATE, newScene.getState(socket.id));
    }

    /**
     * Handles player position and rotation updates.
     */
    private handlePlayerUpdate(socket: Socket, player: Player, data: any) {
        if (!this.scenes.has(player.sceneKey as SceneKey)) return;

        player.position.set(data.spawnPosition.x, data.spawnPosition.y, data.spawnPosition.z);
        player.rotation.set(...data.spawnRotation);

        socket.broadcast.to(player.sceneKey).emit(SocketEvent.CLIENT_UPDATE_PLAYER, data);
    }

    /**
     * Handles sending messages between players.
     */
    private handleSendMessage(socket: Socket, data: any) {
        const { receiverUserId, message } = data;
        if (!receiverUserId || !message) return;
        this.io.to(receiverUserId).emit(SocketEvent.SEND_MESSAGE, {
            senderUserId: socket.id,
            message: this.sanitizeInput(message)
        });
    }

    /**
     * Handles player emote triggers.
     */
    private handleTriggerEmote(socket: Socket, data: any) {
        socket.broadcast.emit(SocketEvent.TRIGGER_EMOTE, {
            animationName: data.animationName,
            userId: data.avatarUserId
        });
    }

    /**
     * Handles player disconnection.
     */
    private handleDisconnect(socket: Socket, player: Player) {
        console.log(`Player disconnected: ${socket.id}`);
        const scene = this.scenes.get(player.sceneKey as SceneKey);
        if (scene) {
            scene.removePlayer(socket.id);
            this.io.to(player.sceneKey).emit(SocketEvent.PLAYER_LEFT, { id: socket.id });
        }
    }

    /**
     * Sanitizes user input to prevent injection attacks.
     */
    private sanitizeInput(input: any): string {
        if (typeof input !== 'string') return '';
        return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
    }
}