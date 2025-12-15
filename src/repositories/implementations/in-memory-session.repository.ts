import { Injectable } from '@nestjs/common';
import { ISessionRepository } from '../interfaces/session.repository.interface';
import { Session } from '../../domain/entities/session.entity';

@Injectable()
export class InMemorySessionRepository implements ISessionRepository {
    private sessions = new Map<string, Session>();
    private socketToSessionMap = new Map<string, string>(); // socketId -> sessionId

    async create(session: Session): Promise<Session> {
        this.sessions.set(session.id, session);
        this.socketToSessionMap.set(session.socketId, session.id);
        return session;
    }

    async findById(sessionId: string): Promise<Session | null> {
        return this.sessions.get(sessionId) || null;
    }

    async findByUserId(userId: string): Promise<Session[]> {
        return Array.from(this.sessions.values()).filter(
            (session) => session.userId === userId,
        );
    }

    async findBySocketId(socketId: string): Promise<Session | null> {
        const sessionId = this.socketToSessionMap.get(socketId);
        if (!sessionId) return null;
        return this.findById(sessionId);
    }

    async delete(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (session) {
            this.socketToSessionMap.delete(session.socketId);
            this.sessions.delete(sessionId);
        }
    }

    async findByRoomId(roomId: string): Promise<Session[]> {
        return Array.from(this.sessions.values()).filter(
            (session) => session.roomId === roomId,
        );
    }
}
