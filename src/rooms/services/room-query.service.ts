import { Injectable, Inject } from '@nestjs/common';
import { IRoomRepository } from '../../repositories/interfaces/room.repository.interface';
import { IRoomInfo } from '../../common/interfaces/room.interface';

@Injectable()
export class RoomQueryService {
    constructor(
        @Inject('IRoomRepository')
        private readonly roomRepository: IRoomRepository,
    ) { }

    /**
     * Get room information
     */
    async getRoomInfo(roomId: string): Promise<IRoomInfo | null> {
        const room = await this.roomRepository.findById(roomId);
        if (!room) return null;

        return {
            roomId: room.id,
            participantCount: room.getParticipantCount(),
            isActive: !room.isEmpty(),
        };
    }

    /**
     * Get all active rooms
     */
    async getActiveRooms(): Promise<IRoomInfo[]> {
        const rooms = await this.roomRepository.findAll();
        return rooms
            .filter((room) => !room.isEmpty())
            .map((room) => ({
                roomId: room.id,
                participantCount: room.getParticipantCount(),
                isActive: true,
            }));
    }

    /**
     * Get room participants
     */
    async getRoomUsers(roomId: string): Promise<string[]> {
        return this.roomRepository.getParticipants(roomId);
    }
}
