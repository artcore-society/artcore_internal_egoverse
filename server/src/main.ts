import { Scene } from './ts/Classes/Scene';
import { Server } from 'socket.io';
import { Player } from './ts/Classes/Player';
import { SceneKey } from "./ts/Enums/SceneKey.ts";
import { SocketEvent } from './ts/Enums/SocketEvent';
import { createServer } from 'node:http';
import express from 'express';
import rateLimit from 'express-rate-limit';
import {ISceneSettings} from "./ts/Interfaces/ISceneSettings.ts";

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Set max allowed players
const MAX_PLAYERS = 100;

// Set scene colors
const scenesSettings: Map<SceneKey, ISceneSettings> = new Map();
scenesSettings.set(SceneKey.LANDING_AREA, { color: 'Red' });
scenesSettings.set(SceneKey.MEETING_ROOM, { color: 'Blue' });
scenesSettings.set(SceneKey.CHAT_ROOM, { color: 'Green' });

// Create scenes map
const scenes: Map<SceneKey, Scene> = new Map(
    Object.values(SceneKey).map(key => [key as SceneKey, new Scene(key, scenesSettings.get(key))])
);

// Security: Input sanitization
function sanitizeInput(input: any): string {
    if (typeof input !== 'string') return '';
    return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

// Security: Prevent brute force attacks on login endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

io.on(SocketEvent.CONNECTION, (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Validate and sanitize user input
    const username = sanitizeInput(socket.handshake.query.username as string);
    const avatarId = String(socket.handshake.query.selectedAvatarId) || '1';
    const sceneKey = sanitizeInput(socket.handshake.query.sceneKey) as SceneKey || SceneKey.LANDING_AREA;

    if (!username || !sceneKey) {
        socket.emit(SocketEvent.FAILED, { message: 'Invalid credentials' });
        socket.disconnect();
        console.warn(`Disconnected ${socket.id} due to invalid credentials`);
        return;
    }

    if (io.engine.clientsCount > MAX_PLAYERS) {
        socket.emit(SocketEvent.FAILED, { message: 'Server is full' });
        socket.disconnect();
        console.warn(`Disconnected ${socket.id} due to full server`);
        return;
    }

    if (!scenes.has(sceneKey)) {
        scenes.set(sceneKey, new Scene(sceneKey));
    }

    const scene = scenes.get(sceneKey)!;
    const player = new Player(socket.id, username, avatarId, sceneKey, true);

    scene.addPlayer(player);
    socket.join(sceneKey);

    // Emit initial data for setup
    socket.emit(SocketEvent.INIT, {
        id: socket.id,
        currentSceneKey: sceneKey,
        scenes: Array.from(scenes.values()).map(scene => {
            return {
                sceneKey: scene.sceneKey,
                settings: scene.settings,
            };
        })
    });

    // Notify scene users that player has joined
    io.to(sceneKey).emit(SocketEvent.PLAYER_JOINED, {
        id: player.id,
        username: player.username,
        avatarId: player.avatarId,
        position: player.position.toArray(),
        rotation: [
            player.rotation.x,
            player.rotation.y,
            player.rotation.z,
            player.rotation.w
        ]
    });

    // Handle scene switching
    socket.on(SocketEvent.JOIN_SCENE, (data) => {
        const newSceneKey = sanitizeInput(data.sceneKey) as SceneKey;
        if (!newSceneKey || !scenes.has(newSceneKey)) {
            socket.emit(SocketEvent.FAILED, { message: 'Invalid scene' });
            return;
        }

        if (player.sceneKey === newSceneKey) {
            console.warn(`Player ${player.id} is already in scene ${newSceneKey}, ignoring.`);

            // Broadcast scene state to sender
            socket.emit(SocketEvent.SCENE_STATE, scene.getState(socket.id));
            return;
        }

        const oldSceneKey = player.sceneKey as SceneKey;
        if (scenes.has(oldSceneKey)) {
            const oldScene = scenes.get(oldSceneKey)!;
            oldScene.removePlayer(socket.id);

            // Send the PLAYER_LEFT event to the sender before they leave the room
            socket.emit(SocketEvent.PLAYER_LEFT, { id: socket.id });

            // Send the PLAYER_LEFT event to everyone else in the old scene
            socket.to(oldSceneKey).emit(SocketEvent.PLAYER_LEFT, { id: socket.id });

            // Now the player leaves the old room
            socket.leave(oldSceneKey);
        }

        const newScene = scenes.get(newSceneKey)!;
        newScene.addPlayer(player);
        socket.join(newSceneKey);
        player.sceneKey = newSceneKey;

        io.to(newSceneKey).emit(SocketEvent.PLAYER_JOINED, {
            id: player.id,
            username: player.username,
            avatarId: player.avatarId,
            position: player.position.toArray(),
            rotation: [
                player.rotation.x,
                player.rotation.y,
                player.rotation.z,
                player.rotation.w
            ],
            sceneKey: newSceneKey
        });

        // Broadcast scene state to sync the scene visitors
        io.to(newSceneKey).emit(SocketEvent.SCENE_STATE, newScene.getState(socket.id));
    });

    socket.on(SocketEvent.CLIENT_UPDATE_PLAYER, (data) => {
        if (!player || !scenes.has(player.sceneKey as SceneKey)) return;

        // Update position and rotation in backend
        player.position.set(data.spawnPosition.x, data.spawnPosition.y, data.spawnPosition.z);
        player.rotation.set(...data.spawnRotation);

        // Broadcast
        socket.broadcast.to(player.sceneKey).emit(SocketEvent.CLIENT_UPDATE_PLAYER, data);
    });

    // Chat messages
    socket.on(SocketEvent.SEND_MESSAGE, (data) => {
        const { receiverUserId, message } = data;
        if (!receiverUserId || !message) return;
        io.to(receiverUserId).emit(SocketEvent.SEND_MESSAGE, {
            senderUserId: socket.id,
            message: sanitizeInput(message)
        });
    });

    // Handle player disconnection
    socket.on(SocketEvent.DISCONNECT, () => {
        console.log(`Player disconnected: ${socket.id}`);
        const scene = scenes.get(player.sceneKey as SceneKey);
        if (scene) {
            scene.removePlayer(socket.id);
            io.to(player.sceneKey).emit(SocketEvent.PLAYER_LEFT, { id: socket.id });
        }
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
