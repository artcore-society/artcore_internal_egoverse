import express from 'express';
import { Server } from 'socket.io';
import { GameService } from './ts/Services/GameService';
import { createServer } from 'node:http';

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
});

// Initialize GameService with io
GameService.initialize(io);

// Start the server
server.listen(3000, () => {
	console.log('Server running at http://localhost:3000');
});
