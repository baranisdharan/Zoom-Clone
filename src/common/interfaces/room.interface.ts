export interface IRoom {
    id: string;
    createdAt: Date;
    maxParticipants?: number;
}

export interface IRoomState {
    roomId: string;
    participants: Set<string>;
    createdAt: Date;
}

export interface IRoomInfo {
    roomId: string;
    participantCount: number;
    isActive: boolean;
}
