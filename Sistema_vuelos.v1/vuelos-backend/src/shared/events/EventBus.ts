import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';

export interface DomainEvent<P = unknown> {
  eventId: string;
  eventType: string;
  eventVersion: number;
  occurredAt: string;
  producer: string;
  correlationId?: string;
  payload: P;
}

class InProcessEventBus extends EventEmitter {
  publish<P>(event: Omit<DomainEvent<P>, 'eventId' | 'occurredAt'>): void {
    const full: DomainEvent<P> = {
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      ...event,
    };
    this.emit(event.eventType, full);
    this.emit('*', full);
  }

  subscribe<P>(eventType: string, handler: (e: DomainEvent<P>) => void): void {
    this.on(eventType, handler);
  }

  subscribeAll(handler: (e: DomainEvent) => void): void {
    this.on('*', handler);
  }
}

// Singleton — in production this would be replaced by a RabbitMQ/Kafka publisher
export const EventBus = new InProcessEventBus();
EventBus.setMaxListeners(100);
