export class RoomModel {
    constructor(
        public id: string,
        public createdAt: Date = new Date(),
        public maxParticipants?: number,
        public name?: string,
    ) { }

    /**
     * Check if room is at capacity
     */
    isFull(currentParticipants: number): boolean {
        if (!this.maxParticipants) return false;
        return currentParticipants >= this.maxParticipants;
    }

    /**
     * Calculate time since room was created
     */
    getAge(): number {
        return Date.now() - this.createdAt.getTime();
    }
}
