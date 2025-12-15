import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { RoomsModule } from './rooms/rooms.module';
import { ConnectionsModule } from './connections/connections.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';

@Module({
    imports: [
        EventsModule,
        RoomsModule,
        ConnectionsModule,
        CommonModule,
        ConfigModule,
    ],
    controllers: [],
    providers: [AppService],
})
export class AppModule { }
