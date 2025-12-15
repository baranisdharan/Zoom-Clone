import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { v4 as uuidV4 } from 'uuid';
import { RoomsService } from './rooms.service';

@Controller()
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) { }

    @Get()
    redirectToRoom(@Res() res: Response) {
        // Generate a new room ID and redirect
        const roomId = uuidV4();
        res.redirect(`/${roomId}`);
    }

    @Get(':room')
    getRoom(@Param('room') roomId: string, @Res() res: Response) {
        // Create or get the room
        this.roomsService.createRoom(roomId);

        // Serve the room HTML page
        res.sendFile(join(__dirname, '..', '..', 'public', 'room.html'));
    }

    @Get('api/rooms')
    getActiveRooms() {
        return this.roomsService.getActiveRooms();
    }

    @Get('api/rooms/:roomId')
    getRoomInfo(@Param('roomId') roomId: string) {
        const roomInfo = this.roomsService.getRoomInfo(roomId);
        if (!roomInfo) {
            return { error: 'Room not found' };
        }
        return roomInfo;
    }
}
