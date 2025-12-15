/**
 * Event Bus Interface - Foundation for event-driven architecture
 */
export interface IEvent {
    eventType: string;
    timestamp: Date;
    payload?: any;
}

export type EventHandler<T extends IEvent = IEvent> = (event: T) => void | Promise<void>;

export interface IEventBus {
    /**
     * Publish an event to all subscribers
     */
    publish<T extends IEvent>(event: T): Promise<void>;

    /**
     * Subscribe to events of a specific type
     */
    subscribe<T extends IEvent>(
        eventType: string,
        handler: EventHandler<T>,
    ): void;

    /**
     * Unsubscribe from events
     */
    unsubscribe(eventType: string, handler: EventHandler): void;
}
