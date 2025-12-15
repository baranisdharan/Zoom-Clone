export class Session {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly socketId: string,
        public readonly roomId: string,
        public readonly peerId: string,
        public readonly connectedAt: Date,
    ) { }

    /**
     * Get session duration in milliseconds
     */
    getDuration(): number {
        return Date.now() - this.connectedAt.getTime();
    }

    /**
     * Check if session is active (connected within last 30 seconds)
     */
    isActive(): boolean {
        const thirtySecondsAgo = Date.now() - 30000;
        return this.connectedAt.getTime() > thirtySecondsAgo;
    }
}
