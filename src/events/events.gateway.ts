import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinRoomEventDto } from './dtos/join-room-event.dto';
import { ParticipantService } from '../rooms/services/participant.service';
import { RoomQueryService } from '../rooms/services/room-query.service';
import { SessionManagementService } from '../connections/services/session-management.service';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class EventsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly participantService: ParticipantService,
        private readonly roomQueryService: RoomQueryService,
        private readonly sessionManagementService: SessionManagementService,
    ) { }

    handleConnection(client: Socket) {
        console.log(`[WebSocket] Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        const userData = await this.sessionManagementService.removeSessionBySocketId(client.id);

        if (!userData) {
            console.log(`[WebSocket] Client disconnected: ${client.id} (no session data found)`);
            return;
        }

        const { roomId, userId } = userData;

        console.log(
            `[WebSocket] User ${userId} disconnected from room ${roomId} (socket: ${client.id})`,
        );

        // Remove user from room
        await this.participantService.removeParticipant(roomId, userId);

        // Get updated room info
        const roomInfo = await this.roomQueryService.getRoomInfo(roomId);
        const remainingUsers = await this.roomQueryService.getRoomUsers(roomId);

        console.log(
            `[WebSocket] Room ${roomId} now has ${roomInfo?.participantCount || 0} participants:`,
            remainingUsers,
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
    async handleJoinRoom(
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

            // Register the session
            await this.sessionManagementService.registerSession(
                client.id,
                userId,
                roomId,
                userId, // peerId is same as userId in current implementation
            );

            // Add user to room
            await this.participantService.addParticipant(roomId, userId);

            // Get updated room info
            const roomInfo = await this.roomQueryService.getRoomInfo(roomId);
            const roomUsers = await this.roomQueryService.getRoomUsers(roomId);

            console.log(
                `[WebSocket] Room ${roomId} now has ${roomInfo?.participantCount} participants:`,
                roomUsers,
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
    async handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; userId: string },
    ) {
        const { roomId, userId } = data;

        console.log(`[WebSocket] User ${userId} leaving room ${roomId}`);

        // Leave the Socket.IO room
        client.leave(roomId);

        // Remove from services
        await this.participantService.removeParticipant(roomId, userId);
        await this.sessionManagementService.removeSessionBySocketId(client.id);

        // Notify others
        client.to(roomId).emit('user-disconnected', userId);

        // Update room stats
        const roomInfo = await this.roomQueryService.getRoomInfo(roomId);
        if (roomInfo) {
            this.server.to(roomId).emit('room-stats', {
                participantCount: roomInfo.participantCount,
            });
        }
    }
}

