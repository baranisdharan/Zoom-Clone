import { Injectable, Inject } from '@nestjs/common';
import { IRoomRepository } from '../../repositories/interfaces/room.repository.interface';
import { Room } from '../../domain/entities/room.entity';

export interface RoomOptions {
    maxParticipants?: number;
}

@Injectable()
export class RoomManagementService {
    constructor(
        @Inject('IRoomRepository')
        private readonly roomRepository: IRoomRepository,
    ) { }

    /**
     * Create a new room
     */
    async createRoom(roomId: string, options?: RoomOptions): Promise<Room> {
        console.log(`[RoomManagement] Creating room ${roomId}`);

        const room = await this.roomRepository.create(roomId, {
            maxParticipants: options?.maxParticipants,
            createdAt: new Date(),
        });

        return room;
    }

    /**
     * Delete a room
     */
    async deleteRoom(roomId: string): Promise<void> {
        console.log(`[RoomManagement] Deleting room ${roomId}`);
        await this.roomRepository.delete(roomId);
    }

    /**
     * Check if room exists
     */
    async roomExists(roomId: string): Promise<boolean> {
        return this.roomRepository.exists(roomId);
    }
}
