import { Injectable } from '@nestjs/common';
import { IUser } from '../common/interfaces/user.interface';

@Injectable()
export class ConnectionsService {
    // socketId -> user data
    private socketUserMap = new Map<
        string,
        { roomId: string; userId: string }
    >();

    // userId -> peer connection data
    private userConnections = new Map<
        string,
        { peerId: string; socketId: string; roomId: string; connectedAt: Date }
    >();

    /**
     * Register a socket connection with user info
     */
    registerConnection(
        socketId: string,
        userId: string,
        roomId: string,
        peerId?: string,
    ): void {
        this.socketUserMap.set(socketId, { roomId, userId });

        if (peerId) {
            this.userConnections.set(userId, {
                peerId,
                socketId,
                roomId,
                connectedAt: new Date(),
            });
        }
    }

    /**
     * Remove a connection by socket ID
     */
    removeConnection(socketId: string): {
        roomId: string;
        userId: string;
    } | null {
        const userData = this.socketUserMap.get(socketId);
        if (!userData) return null;

        this.socketUserMap.delete(socketId);
        this.userConnections.delete(userData.userId);

        return userData;
    }

    /**
     * Get user data by socket ID
     */
    getUserBySocketId(
        socketId: string,
    ): { roomId: string; userId: string } | null {
        return this.socketUserMap.get(socketId) || null;
    }

    /**
     * Get connection info by user ID
     */
    getConnectionByUserId(userId: string) {
        return this.userConnections.get(userId) || null;
    }

    /**
     * Get all connections in a room
     */
    getRoomConnections(roomId: string): string[] {
        const connections: string[] = [];

        this.socketUserMap.forEach((data, socketId) => {
            if (data.roomId === roomId) {
                connections.push(data.userId);
            }
        });

        return connections;
    }

    /**
     * Get total active connections
     */
    getActiveConnectionCount(): number {
        return this.socketUserMap.size;
    }
}
