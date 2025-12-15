import { Injectable } from '@nestjs/common';
import {
    IRoomRepository,
    RoomMetadata,
} from '../interfaces/room.repository.interface';
import { Room } from '../../domain/entities/room.entity';

@Injectable()
export class InMemoryRoomRepository implements IRoomRepository {
    private rooms = new Map<string, Room>();

    async create(roomId: string, metadata?: RoomMetadata): Promise<Room> {
        const room = new Room(
            roomId,
            metadata?.createdAt || new Date(),
            metadata?.maxParticipants,
        );
        this.rooms.set(roomId, room);
        return room;
    }

    async findById(roomId: string): Promise<Room | null> {
        return this.rooms.get(roomId) || null;
    }

    async findAll(): Promise<Room[]> {
        return Array.from(this.rooms.values());
    }

    async update(room: Room): Promise<void> {
        this.rooms.set(room.id, room);
    }

    async delete(roomId: string): Promise<void> {
        this.rooms.delete(roomId);
    }

    async addParticipant(roomId: string, userId: string): Promise<void> {
        const room = await this.findById(roomId);
        if (!room) {
            throw new Error(`Room ${roomId} not found`);
        }
        room.addParticipant(userId);
        await this.update(room);
    }

    async removeParticipant(roomId: string, userId: string): Promise<void> {
        const room = await this.findById(roomId);
        if (!room) {
            return; // Room already deleted
        }
        room.removeParticipant(userId);

        // Clean up empty rooms
        if (room.isEmpty()) {
            await this.delete(roomId);
            console.log(`[RoomRepository] Deleted empty room ${roomId}`);
        } else {
            await this.update(room);
        }
    }

    async getParticipants(roomId: string): Promise<string[]> {
        const room = await this.findById(roomId);
        return room ? room.getParticipants() : [];
    }

    async exists(roomId: string): Promise<boolean> {
        return this.rooms.has(roomId);
    }
}
