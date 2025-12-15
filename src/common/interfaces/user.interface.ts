export interface IUser {
    id: string;
    peerId: string;
    socketId: string;
    roomId: string;
    joinedAt: Date;
}

export interface IUserSession {
    userId: string;
    peerId: string;
    isConnected: boolean;
    hasVideo: boolean;
    hasAudio: boolean;
}
