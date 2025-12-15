import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service';
import { ConnectionsService } from '../connections/connections.service';
import { JoinRoomEventDto } from './dtos/join-room-event.dto';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class EventsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly roomsService: RoomsService,
        private readonly connectionsService: ConnectionsService,
    ) { }

    handleConnection(client: Socket) {
        console.log(`[WebSocket] Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const userData = this.connectionsService.removeConnection(client.id);

        if (!userData) {
            console.log(`[WebSocket] Client disconnected: ${client.id} (no user data found)`);
            return;
        }

        const { roomId, userId } = userData;

        console.log(
            `[WebSocket] User ${userId} disconnected from room ${roomId} (socket: ${client.id})`,
        );

        // Remove user from room
        this.roomsService.removeUserFromRoom(roomId, userId);

        // Get updated room info
        const roomInfo = this.roomsService.getRoomInfo(roomId);
        const remainingUsers = this.roomsService.getRoomUsers(roomId);

        console.log(
            `[WebSocket] Room ${roomId} now has ${roomInfo?.participantCount || 0} participants:`,
            Array.from(remainingUsers),
        );

        // Notify others in the room
        client.to(roomId).emit('user-disconnected', userId);

        // Emit room stats update to remaining users
        if (roomInfo) {
            this.server.to(roomId).emit('room-stats', {
                participantCount: roomInfo.participantCount,
            });
            console.log(
                `[WebSocket] Broadcasting room-stats after disconnect to ${roomId}: ${roomInfo.participantCount} participants`,
            );
        }
    }

    @SubscribeMessage('join-room')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: JoinRoomEventDto,
    ) {
        try {
            const { roomId, userId } = data;

            console.log(
                `[WebSocket] User ${userId} joining room ${roomId} via socket ${client.id}`,
            );

            // Join the Socket.IO room first
            client.join(roomId);

            // Register the connection
            this.connectionsService.registerConnection(
                client.id,
                userId,
                roomId,
            );

            // Add user to room
            this.roomsService.addUserToRoom(roomId, userId);

            // Get updated room info
            const roomInfo = this.roomsService.getRoomInfo(roomId);
            const roomUsers = this.roomsService.getRoomUsers(roomId);

            console.log(
                `[WebSocket] Room ${roomId} now has ${roomInfo?.participantCount} participants:`,
                Array.from(roomUsers),
            );

            // Notify all OTHER users in the room about this new connection
            client.to(roomId).emit('user-connected', userId);

            // Send room stats to ALL users in the room (including the one who just joined)
            if (roomInfo) {
                this.server.to(roomId).emit('room-stats', {
                    participantCount: roomInfo.participantCount,
                });
                console.log(
                    `[WebSocket] Broadcasting room-stats to ${roomId}: ${roomInfo.participantCount} participants`,
                );
            }

            console.log(
                `[WebSocket] User ${userId} successfully joined room ${roomId}. Total participants: ${roomInfo?.participantCount}`,
            );
        } catch (error) {
            console.error('[WebSocket] Error joining room:', error);
            client.emit('error', {
                message: 'Failed to join room',
                error: error.message,
            });
        }
    }

    @SubscribeMessage('leave-room')
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; userId: string },
    ) {
        const { roomId, userId } = data;

        console.log(`[WebSocket] User ${userId} leaving room ${roomId}`);

        // Leave the Socket.IO room
        client.leave(roomId);

        // Remove from services
        this.roomsService.removeUserFromRoom(roomId, userId);
        this.connectionsService.removeConnection(client.id);

        // Notify others
        client.to(roomId).emit('user-disconnected', userId);

        // Update room stats
        const roomInfo = this.roomsService.getRoomInfo(roomId);
        if (roomInfo) {
            this.server.to(roomId).emit('room-stats', {
                participantCount: roomInfo.participantCount,
            });
        }
    }
}

