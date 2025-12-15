import { IEvent } from '../event-bus.interface';

export class RoomCreatedEvent implements IEvent {
    eventType = 'room.created';
    timestamp = new Date();

    constructor(
        public roomId: string,
        public createdBy?: string,
    ) { }
}

export class RoomDeletedEvent implements IEvent {
    eventType = 'room.deleted';
    timestamp = new Date();

    constructor(public roomId: string) { }
}

export class ParticipantJoinedEvent implements IEvent {
    eventType = 'participant.joined';
    timestamp = new Date();

    constructor(
        public roomId: string,
        public userId: string,
    ) { }
}

export class ParticipantLeftEvent implements IEvent {
    eventType = 'participant.left';
    timestamp = new Date();

    constructor(
        public roomId: string,
        public userId: string,
    ) { }
}
