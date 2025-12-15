import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { v4 as uuidV4 } from 'uuid';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    redirectToRoom(@Res() res: Response) {
        // Redirect to a random room
        res.redirect(`/${uuidV4()}`);
    }

    @Get(':room')
    getRoom(@Res() res: Response) {
        // Serve static HTML file - room ID will be extracted from URL on client side
        res.sendFile(join(__dirname, '..', 'public', 'room.html'));
    }
}
