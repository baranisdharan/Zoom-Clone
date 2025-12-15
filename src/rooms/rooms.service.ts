import { Injectable } from '@nestjs/common';
import { IRoomState, IRoomInfo } from '../common/interfaces/room.interface';
import { RoomFullException } from '../common/exceptions/room-full.exception';

@Injectable()
export class RoomsService {
    // roomId -> Set<userId>
    private rooms = new Map<string, Set<string>>();
    private roomMetadata = new Map<
        string,
        { createdAt: Date; maxParticipants?: number }
    >();

    /**
     * Create a new room
     */
    createRoom(roomId: string, maxParticipants?: number): IRoomState {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
            this.roomMetadata.set(roomId, {
                createdAt: new Date(),
                maxParticipants,
            });
        }

        return {
            roomId,
            participants: this.rooms.get(roomId)!,
            createdAt: this.roomMetadata.get(roomId)!.createdAt,
        };
    }

    /**
     * Add a user to a room
     */
    addUserToRoom(roomId: string, userId: string): void {
        if (!this.rooms.has(roomId)) {
            this.createRoom(roomId);
        }

        const room = this.rooms.get(roomId)!;
        const metadata = this.roomMetadata.get(roomId)!;

        // Check room capacity
        if (
            metadata.maxParticipants &&
            room.size >= metadata.maxParticipants
        ) {
            throw new RoomFullException(roomId, metadata.maxParticipants);
        }

        room.add(userId);
    }

    /**
     * Remove a user from a room
     */
    removeUserFromRoom(roomId: string, userId: string): void {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.delete(userId);

        // Clean up empty rooms
        if (room.size === 0) {
            this.rooms.delete(roomId);
            this.roomMetadata.delete(roomId);
        }
    }

    /**
     * Get room information
     */
    getRoomInfo(roomId: string): IRoomInfo | null {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        return {
            roomId,
            participantCount: room.size,
            isActive: room.size > 0,
        };
    }

    /**
     * Get all users in a room
     */
    getRoomUsers(roomId: string): Set<string> {
        return this.rooms.get(roomId) || new Set();
    }

    /**
     * Check if a room exists
     */
    roomExists(roomId: string): boolean {
        return this.rooms.has(roomId);
    }

    /**
     * Get all active rooms
     */
    getActiveRooms(): IRoomInfo[] {
        const rooms: IRoomInfo[] = [];

        this.rooms.forEach((participants, roomId) => {
            rooms.push({
                roomId,
                participantCount: participants.size,
                isActive: participants.size > 0,
            });
        });

        return rooms;
    }
}
