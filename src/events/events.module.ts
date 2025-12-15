import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RoomsModule } from '../rooms/rooms.module';
import { ConnectionsModule } from '../connections/connections.module';

@Module({
    imports: [RoomsModule, ConnectionsModule],
    providers: [EventsGateway],
})
export class EventsModule { }
