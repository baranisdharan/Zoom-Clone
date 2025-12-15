import { Module } from '@nestjs/common';
import { InMemoryRoomRepository } from './implementations/in-memory-room.repository';
import { InMemorySessionRepository } from './implementations/in-memory-session.repository';
import { InMemoryUserRepository } from './implementations/in-memory-user.repository';

@Module({
    providers: [
        {
            provide: 'IRoomRepository',
            useClass: InMemoryRoomRepository,
        },
        {
            provide: 'ISessionRepository',
            useClass: InMemorySessionRepository,
        },
        {
            provide: 'IUserRepository',
            useClass: InMemoryUserRepository,
        },
    ],
    exports: ['IRoomRepository', 'ISessionRepository', 'IUserRepository'],
})
export class RepositoriesModule { }
