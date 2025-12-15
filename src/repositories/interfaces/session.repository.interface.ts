import { Session } from '../../domain/entities/session.entity';

export interface ISessionRepository {
    /**
     * Create a new session
     */
    create(session: Session): Promise<Session>;

    /**
     * Find session by ID
     */
    findById(sessionId: string): Promise<Session | null>;

    /**
     * Find all sessions for a user
     */
    findByUserId(userId: string): Promise<Session[]>;

    /**
     * Find session by socket ID
     */
    findBySocketId(socketId: string): Promise<Session | null>;

    /**
     * Delete session
     */
    delete(sessionId: string): Promise<void>;

    /**
     * Get all active sessions in a room
     */
    findByRoomId(roomId: string): Promise<Session[]>;
}
