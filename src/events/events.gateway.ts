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

@WebSocketGateway({
    cors: { origin: '*' },
})
export class EventsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // socket.id -> { roomId, userId }
    private socketUserMap = new Map<
        string,
        { roomId: string; userId: string }
    >();

    // roomId -> Set<userId>
    private roomUsers = new Map<string, Set<string>>();

    handleConnection(client: Socket) {
        console.log('Connected:', client.id);
    }

    handleDisconnect(client: Socket) {
        const userData = this.socketUserMap.get(client.id);

        if (!userData) return;

        const { roomId, userId } = userData;

        console.log(`Disconnected: ${userId} from ${roomId}`);

        // Remove user from room set
        const users = this.roomUsers.get(roomId);
        if (users) {
            users.delete(userId);
            if (users.size === 0) {
                this.roomUsers.delete(roomId);
            }
        }

        // Notify others
        client.to(roomId).emit('user-disconnected', userId);

        // Cleanup
        this.socketUserMap.delete(client.id);
    }

    @SubscribeMessage('join-room')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; userId: string },
    ) {
        const { roomId, userId } = data;

        // Join the Socket.IO room
        client.join(roomId);

        // Track this socket's user info for cleanup on disconnect
        this.socketUserMap.set(client.id, { roomId, userId });

        // Track room membership
        if (!this.roomUsers.has(roomId)) {
            this.roomUsers.set(roomId, new Set());
        }
        this.roomUsers.get(roomId)!.add(userId);

        // Notify all OTHER users in the room about this new connection
        client.to(roomId).emit('user-connected', userId);

        console.log(`User ${userId} joined room ${roomId}`);
    }
}
