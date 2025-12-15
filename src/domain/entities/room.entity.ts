import { RoomFullException } from '../../common/exceptions/room-full.exception';

export class Room {
    private participants: Set<string> = new Set();

    constructor(
        public readonly id: string,
        public readonly createdAt: Date,
        public readonly maxParticipants?: number,
    ) { }

    /**
     * Add a participant to the room
     */
    addParticipant(userId: string): void {
        if (this.isFull()) {
            throw new RoomFullException(this.id, this.maxParticipants!);
        }
        this.participants.add(userId);
    }

    /**
     * Remove a participant from the room
     */
    removeParticipant(userId: string): void {
        this.participants.delete(userId);
    }

    /**
     * Check if room is full
     */
    isFull(): boolean {
        return (
            this.maxParticipants !== undefined &&
            this.participants.size >= this.maxParticipants
        );
    }

    /**
     * Check if room is empty
     */
    isEmpty(): boolean {
        return this.participants.size === 0;
    }

    /**
     * Get participant count
     */
    getParticipantCount(): number {
        return this.participants.size;
    }

    /**
     * Get all participants
     */
    getParticipants(): string[] {
        return Array.from(this.participants);
    }

    /**
     * Check if user is in room
     */
    hasParticipant(userId: string): boolean {
        return this.participants.has(userId);
    }

    /**
     * Get room age in milliseconds
     */
    getAge(): number {
        return Date.now() - this.createdAt.getTime();
    }
}
