import { Injectable, Inject } from '@nestjs/common';
import { IRoomRepository } from '../../repositories/interfaces/room.repository.interface';

@Injectable()
export class ParticipantService {
    constructor(
        @Inject('IRoomRepository')
        private readonly roomRepository: IRoomRepository,
    ) { }

    /**
     * Add participant to room
     */
    async addParticipant(roomId: string, userId: string): Promise<void> {
        console.log(
            `[ParticipantService] Adding user ${userId} to room ${roomId}`,
        );

        // Create room if it doesn't exist
        const exists = await this.roomRepository.exists(roomId);
        if (!exists) {
            await this.roomRepository.create(roomId);
        }

        await this.roomRepository.addParticipant(roomId, userId);

        const participants = await this.roomRepository.getParticipants(roomId);
        console.log(
            `[ParticipantService] Room ${roomId} now has ${participants.length} participants`,
        );
    }

    /**
     * Remove participant from room
     */
    async removeParticipant(roomId: string, userId: string): Promise<void> {
        console.log(
            `[ParticipantService] Removing user ${userId} from room ${roomId}`,
        );

        await this.roomRepository.removeParticipant(roomId, userId);

        const participants = await this.roomRepository.getParticipants(roomId);
        console.log(
            `[ParticipantService] Room ${roomId} now has ${participants.length} participants`,
        );
    }

    /**
     * Get all participants in a room
     */
    async getParticipants(roomId: string): Promise<string[]> {
        return this.roomRepository.getParticipants(roomId);
    }
}
