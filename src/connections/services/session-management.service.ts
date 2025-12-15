import { Injectable, Inject } from '@nestjs/common';
import { ISessionRepository } from '../../repositories/interfaces/session.repository.interface';
import { Session } from '../../domain/entities/session.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionManagementService {
    constructor(
        @Inject('ISessionRepository')
        private readonly sessionRepository: ISessionRepository,
    ) { }

    /**
     * Register a new session
     */
    async registerSession(
        socketId: string,
        userId: string,
        roomId: string,
        peerId: string,
    ): Promise<Session> {
        const session = new Session(
            uuidv4(),
            userId,
            socketId,
            roomId,
            peerId,
            new Date(),
        );

        await this.sessionRepository.create(session);
        console.log(
            `[SessionManagement] Registered session ${session.id} for user ${userId}`,
        );

        return session;
    }

    /**
     * Remove session by socket ID
     */
    async removeSessionBySocketId(
        socketId: string,
    ): Promise<{ roomId: string; userId: string } | null> {
        const session = await this.sessionRepository.findBySocketId(socketId);
        if (!session) return null;

        await this.sessionRepository.delete(session.id);
        console.log(
            `[SessionManagement] Removed session ${session.id} for user ${session.userId}`,
        );

        return {
            roomId: session.roomId,
            userId: session.userId,
        };
    }

    /**
     * Get session by socket ID
     */
    async getSessionBySocketId(
        socketId: string,
    ): Promise<Session | null> {
        return this.sessionRepository.findBySocketId(socketId);
    }

    /**
     * Get all sessions in a room
     */
    async getRoomSessions(roomId: string): Promise<Session[]> {
        return this.sessionRepository.findByRoomId(roomId);
    }

    /**
     * Get active connection count
     */
    async getActiveConnectionCount(): Promise<number> {
        const allSessions = await this.sessionRepository.findByUserId(''); // Hack to get all
        return allSessions.length;
    }
}
