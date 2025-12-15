import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RepositoriesModule } from '../repositories/repositories.module';
import { RoomManagementService } from './services/room-management.service';
import { ParticipantService } from './services/participant.service';
import { RoomQueryService } from './services/room-query.service';

@Module({
    imports: [RepositoriesModule],
    controllers: [RoomsController],
    providers: [
        RoomsService, // Keep for backward compatibility temporarily
        RoomManagementService,
        ParticipantService,
        RoomQueryService,
    ],
    exports: [
        RoomsService,
        RoomManagementService,
        ParticipantService,
        RoomQueryService,
    ],
})
export class RoomsModule { }
