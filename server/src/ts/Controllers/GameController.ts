import { Socket } from 'socket.io';
import { Player } from "../Classes/Player.ts";
import { SocketEvent } from '../Enums/SocketEvent';
import { SceneService } from '../Services/SceneService.ts';
import { Vector3, Euler } from 'three';

export class GameController {
    static onPlayerConnect(socket: Socket): void {
        const username = socket.handshake.query.username as string;
        const avatarId = socket.handshake.query.avatarId as string;
        const sceneKey = socket.handshake.query.sceneKey as string;

        const scene = SceneService.getOrCreateScene(sceneKey);
        const player = new Player(socket.id, username, avatarId, true);
        scene.addPlayer(player);

        socket.emit(SocketEvent.INIT, scene.getState(socket.id));
        socket.broadcast.emit(SocketEvent.USER_CONNECT, player);
    }

    static onPlayerMove(socket: Socket, data: any): void {
        const { position, rotation } = data;
        const scene = SceneService.getOrCreateScene(data.sceneKey);

        if (scene.players.has(socket.id)) {
            scene.players.get(socket.id)!.updatePosition(new Vector3(...position), new Euler(...rotation));
            socket.broadcast.emit(SocketEvent.CLIENT_UPDATE_PLAYER, data);
        }
    }

    static onPlayerDisconnect(socket: Socket): void {
        const scene = SceneService.getOrCreateScene('default');
        scene.removePlayer(socket.id);
        socket.broadcast.emit(SocketEvent.USER_DISCONNECT, { id: socket.id });
    }
}