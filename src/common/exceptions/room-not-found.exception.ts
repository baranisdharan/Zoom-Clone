import { NotFoundException } from '@nestjs/common';

export class RoomNotFoundException extends NotFoundException {
    constructor(roomId: string) {
        super(`Room with ID "${roomId}" not found`);
    }
}
