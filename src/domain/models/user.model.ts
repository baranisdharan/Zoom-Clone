export class UserModel {
    constructor(
        public id: string,
        public peerId: string,
        public roomId: string,
        public joinedAt: Date = new Date(),
    ) { }

    /**
     * Get session duration in milliseconds
     */
    getSessionDuration(): number {
        return Date.now() - this.joinedAt.getTime();
    }
}
