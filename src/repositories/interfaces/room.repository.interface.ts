import { Room } from '../../domain/entities/room.entity';

export interface RoomMetadata {
    maxParticipants?: number;
    createdAt?: Date;
}

export interface IRoomRepository {
    /**
     * Create a new room
     */
    create(roomId: string, metadata?: RoomMetadata): Promise<Room>;

    /**
     * Find room by ID
     */
    findById(roomId: string): Promise<Room | null>;

    /**
     * Find all rooms
     */
    findAll(): Promise<Room[]>;

    /**
     * Update room
     */
    update(room: Room): Promise<void>;

    /**
     * Delete room
     */
    delete(roomId: string): Promise<void>;

    /**
     * Add participant to room
     */
    addParticipant(roomId: string, userId: string): Promise<void>;

    /**
     * Remove participant from room
     */
    removeParticipant(roomId: string, userId: string): Promise<void>;

    /**
     * Get all participants in a room
     */
    getParticipants(roomId: string): Promise<string[]>;

    /**
     * Check if room exists
     */
    exists(roomId: string): Promise<boolean>;
}
