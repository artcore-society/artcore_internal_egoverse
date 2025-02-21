import { Server } from 'socket.io';
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

io.on('connection', async (socket) => {
    const sockets = await io.fetchSockets();

    // Send information about other connected users
    io.to(socket.id).emit('init', {
        id: socket.id,
        users: sockets.map((socket) => socket.id)
    });

    // Register user specific event
    socket.on('client-spawn-player', (data) => {
        io.to(data.userId).emit('client-spawn-player', {
            visitorId: data.visitorId,
            sceneKey: data.sceneKey
        });
    });

    // Register joining scene event
    socket.on('join-scene', (data) => {
        io.emit('join-scene', {
            userId: data.userId,
            sceneKey: data.sceneKey
        });
    });

    // Send player data to everyone but yourself
    socket.on('client-update-player', (data) => {
        socket.broadcast.emit('client-update-player', data);
    });

    // Let everyone know a new user connected (except himself)
    socket.broadcast.emit('user:connect', {
        id: socket.id,
        username: socket.handshake.query.username
    });

    // Let everyone know a user disconnected (except himself)
    socket.on('disconnect', () => {
        socket.broadcast.emit('user:disconnect', {
            id: socket.id
        });
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});