import { BadRequestException } from '@nestjs/common';

export class RoomFullException extends BadRequestException {
    constructor(roomId: string, maxParticipants: number) {
        super(
            `Room "${roomId}" is full. Maximum participants: ${maxParticipants}`,
        );
    }
}
