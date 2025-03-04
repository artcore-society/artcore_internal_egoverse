import { Scene } from '../Classes/Scene';
import { Player } from '../Classes/Player';
import { SceneKey } from '../Enums/SceneKey';
import { SocketEvent } from '../Enums/SocketEvent';
import { Server, Socket } from 'socket.io';
import { ISceneSettings } from '../Interfaces/ISceneSettings';
import { Quaternion, Vector3 } from 'three';

export class GameService {
    private static _instance: GameService;
    private io: Server;
    private scenes: Map<SceneKey, Scene> = new Map();
    private readonly MAX_PLAYERS = 100;

    /**
     * Private constructor to enforce singleton pattern and initialize scenes & sockets.
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

        // Creates scene instances and stores them in the map.
        this.scenes = new Map(
            Object.values(SceneKey).map(key => [key as SceneKey, new Scene(key, scenesSettings.get(key))])
        );
    }

    /**
     * Sets up WebSocket event listeners for handling client connections.
     */
    private setupSocketEvents() {
        this.io.on(SocketEvent.CONNECTION, (socket) => this.handleConnection(socket));
    }

    /**
     * Handles a new player connection, validates input, and assigns a scene.
     */
    private handleConnection(socket: Socket) {
        console.log(`New connection: ${socket.id}`);

        const username = this.sanitizeInput(socket.handshake.query.username as string);
        const avatarId = String(socket.handshake.query.selectedAvatarId) || '1';
        const sceneKey = this.sanitizeInput(socket.handshake.query.sceneKey) as SceneKey || SceneKey.LANDING_AREA;

        // Validate username and scene key.
        if (!username || !sceneKey) {
            socket.emit(SocketEvent.FAILED, { message: 'Invalid credentials' });
            socket.disconnect();
            return;
        }

        // Prevents new connections if the server is at full capacity.
        if (this.io.engine.clientsCount > this.MAX_PLAYERS) {
            socket.emit(SocketEvent.FAILED, { message: 'Server is full' });
            socket.disconnect();
            return;
        }

        // Assigns the player to the specified scene.
        const scene = this.scenes.get(sceneKey)!;
        const player = new Player(socket.id, username, avatarId, sceneKey, true);
        scene.addPlayer(player);
        socket.join(sceneKey);

        // Sends initialization data to the player.
        socket.emit(SocketEvent.INIT, {
            id: socket.id,
            currentSceneKey: sceneKey,
            scenes: Array.from(this.scenes.values()).map(scene => ({
                sceneKey: scene.sceneKey,
                settings: scene.settings,
            }))
        });

        // Broadcasts the new player to others in the scene.
        this.io.to(sceneKey).emit(SocketEvent.PLAYER_JOINED, {
            id: player.id,
            username: player.username,
            avatarId: player.avatarId,
            position: player.position.toArray(),
            quaternion: [player.quaternion.x, player.quaternion.y, player.quaternion.z, player.quaternion.w]
        });

        // Sets up event listeners for player interactions.
        socket.on(SocketEvent.JOIN_SCENE, (data) => this.handleJoinScene(socket, player, data));
        socket.on(SocketEvent.CLIENT_UPDATE_PLAYER, (data) => this.handlePlayerUpdate(socket, player, data));
        socket.on(SocketEvent.SEND_MESSAGE, (data) => this.handleSendMessage(socket, data));
        socket.on(SocketEvent.TRIGGER_EMOTE, (data) => this.handleTriggerEmote(socket, data));
        socket.on(SocketEvent.DISCONNECT, () => this.handleDisconnect(socket, player));
    }

    /**
     * Handles player switching to a different scene.
     */
    private handleJoinScene(socket: Socket, player: Player, data: any) {
        // Sanitize and retrieve the new scene key from the incoming data.
        const newSceneKey = this.sanitizeInput(data.sceneKey) as SceneKey;

        // Check if the new scene key is valid and exists in the scenes map.
        if (!newSceneKey || !this.scenes.has(newSceneKey)) {
            socket.emit(SocketEvent.FAILED, { message: 'Invalid scene' });
            return;
        }

        // Avoid redundant scene switching by checking if the player is already in the target scene.
        if (player.sceneKey === newSceneKey) {
            socket.emit(SocketEvent.SCENE_STATE, this.scenes.get(player.sceneKey)!.getState(socket.id));
            return;
        }

        // Store the old scene key before switching.
        const oldSceneKey = player.sceneKey as SceneKey;

        // Remove the player from the old scene if it exists.
        if (this.scenes.has(oldSceneKey)) {
            const oldScene = this.scenes.get(oldSceneKey)!;

            // Remove player from the old scene.
            oldScene.removePlayer(socket.id);

            // Remove the socket from the old scene's room.
            socket.leave(oldSceneKey);

            // Notify others in the old scene.
            this.io.to(oldSceneKey).emit(SocketEvent.PLAYER_LEFT, { id: socket.id });
        }

        // Retrieve the new scene from the scenes map.
        const newScene = this.scenes.get(newSceneKey)!;

        // Add the player to the new scene and update their sceneKey.
        newScene.addPlayer(player);

        // Add the player to the new scene's socket room.
        socket.join(newSceneKey);

        // Update the player's scene reference.
        player.sceneKey = newSceneKey;

        // Notify all players in the new scene that a new player has joined.
        this.io.to(newSceneKey).emit(SocketEvent.PLAYER_JOINED, {
            id: player.id,
            username: player.username,
            avatarId: player.avatarId,
            position: player.position.toArray(),
            quaternion: [player.quaternion.x, player.quaternion.y, player.quaternion.z, player.quaternion.w],
            sceneKey: newSceneKey
        });

        // Send the updated scene state to the newly joined player.
        this.io.to(newSceneKey).emit(SocketEvent.SCENE_STATE, newScene.getState(socket.id));
    }

    /**
     * Handles player movement and quaternion updates.
     */
    private handlePlayerUpdate(socket: Socket, player: Player, data: any) {
        // Check if the scene associated with the player exists
        if (!this.scenes.has(player.sceneKey as SceneKey)) {
            return;
        }

        // Convert websocket data
        const spawnPosition = new Vector3(...data.spawnPosition);
        const spawnRotation = new Quaternion(...data.spawnRotation);

        console.log("Received spawnRotation:", data.spawnRotation);
        console.log("Parsed spawnRotation:", spawnRotation);

        // Update the player's position based on received data
        player.position.copy(spawnPosition);

        // Update the player's quaternion using the provided quaternion array
        player.quaternion.copy(spawnRotation);

        // Broadcast the updated player data to all clients in the same scene
        socket.broadcast.to(player.sceneKey).emit(SocketEvent.CLIENT_UPDATE_PLAYER, data);
    }

    /**
     * Handles sending messages between players.
     */
    private handleSendMessage(socket: Socket, data: any) {
        // Destructure the receiver's user ID and message from the incoming data
        const { receiverUserId, message } = data;

        // Validate that both receiverUserId and message exist; return if either is missing
        if (!receiverUserId || !message) {
            return;
        }

        // Send the message to the specified receiver user ID
        this.io.to(receiverUserId).emit(SocketEvent.SEND_MESSAGE, {
            senderUserId: socket.id, // Include sender's socket ID for identification
            message: this.sanitizeInput(message) // Sanitize message before sending to prevent injection attacks
        });
    }

    /**
     * Handles player emote triggers.
     */
    private handleTriggerEmote(socket: Socket, data: any) {
        // Broadcast the emote trigger event to all connected clients except the sender
        socket.broadcast.emit(SocketEvent.TRIGGER_EMOTE, {
            animationName: data.animationName, // Name of the emote animation to be played
            userId: data.avatarUserId // User ID of the avatar performing the emote
        });
    }

    /**
     * Handles player disconnection.
     */
    private handleDisconnect(socket: Socket, player: Player) {
        console.log(`Player disconnected: ${socket.id}`);

        // Retrieve the scene the player was in using their scene key
        const scene = this.scenes.get(player.sceneKey as SceneKey);

        // If the scene exists, remove the player from it and notify other players
        if (scene) {
            scene.removePlayer(socket.id); // Remove the player from the scene
            this.io.to(player.sceneKey).emit(SocketEvent.PLAYER_LEFT, { id: socket.id }); // Notify others in the same scene
        }
    }

    /**
     * Sanitizes user input to prevent injection attacks.
     */
    private sanitizeInput(input: any): string {
        // Ensure the input is a string; if not, return an empty string
        if (typeof input !== 'string') {
            return '';
        }

        // Replace HTML special characters to prevent potential XSS attacks
        return input
            .replace(/</g, '&lt;') // Replace '<' with '&lt;' to prevent HTML injection
            .replace(/>/g, '&gt;') // Replace '>' with '&gt;' to prevent HTML injection
            .trim(); // Remove leading and trailing whitespace
    }
}