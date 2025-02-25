import { Server } from 'socket.io';
import { SocketEvent } from "./ts/Enums/SocketEvent.ts";
import { createServer } from 'node:http';
import express from 'express';

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const MAX_PLAYERS = 10;

io.on('connection', async (socket) => {
    const sockets = await io.fetchSockets();

    if (sockets.length > MAX_PLAYERS) {
        socket.emit(SocketEvent.FAILED, { message: "Server is full" });
        socket.disconnect();
        return;
    }

    // Send information about other connected users
    io.to(socket.id).emit(SocketEvent.INIT, {
        id: socket.id,
        users: sockets.map((s) => s.id)
    });

    // Register user specific event
    socket.on(SocketEvent.CLIENT_SPAWN_PLAYER, (data) => {
        io.to(data.userId).emit(SocketEvent.CLIENT_SPAWN_PLAYER, {
            visitorId: data.visitorId,
            sceneKey: data.sceneKey,
            spawnPosition: data.spawnPosition,
            spawnRotation: data.spawnRotation,
            username: data.username,
            selectedAvatarId: data.selectedAvatarId
        });
    });

    // Register user specific event
    socket.on(SocketEvent.SEND_MESSAGE, (data) => {
        io.to(data.receiverUserId).emit(SocketEvent.SEND_MESSAGE, {
            message: data.message,
            senderUserId: data.senderUserId,
        });
    });

    // Register joining scene event
    socket.on(SocketEvent.JOIN_SCENE, (data) => {
        io.emit(SocketEvent.JOIN_SCENE, {
            userId: data.userId,
            sceneKey: data.sceneKey,
            selectedAvatarId: data.selectedAvatarId,
            spawnPosition: data.spawnPosition,
            spawnRotation: data.spawnRotation,
        });
    });

    // Send player data to everyone but yourself
    socket.on(SocketEvent.CLIENT_UPDATE_PLAYER, (data) => {
        socket.broadcast.emit(SocketEvent.CLIENT_UPDATE_PLAYER, data);
    });

    // Let everyone know a new user connected (except himself)
    socket.broadcast.emit(SocketEvent.USER_CONNECT, {
        id: socket.id,
        username: socket.handshake.query.username,
        selectedAvatarId: socket.handshake.query.selectedAvatarId
    });

    // Let everyone know a user disconnected (except himself)
    socket.on('disconnect', () => {
        socket.broadcast.emit(SocketEvent.USER_DISCONNECT, {
            id: socket.id
        });
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});