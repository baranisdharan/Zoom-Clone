import { Module } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { RepositoriesModule } from '../repositories/repositories.module';
import { SessionManagementService } from './services/session-management.service';

@Module({
    imports: [RepositoriesModule],
    providers: [
        ConnectionsService, // Keep for backward compatibility
        SessionManagementService,
    ],
    exports: [ConnectionsService, SessionManagementService],
})
export class ConnectionsModule { }
