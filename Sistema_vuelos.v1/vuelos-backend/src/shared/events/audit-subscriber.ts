import { EventBus, DomainEvent } from './EventBus.js';

export function registerAuditSubscriber(serviceName: string): void {
  EventBus.subscribeAll((event: DomainEvent) => {
    console.log(JSON.stringify({
      level: 'info',
      component: serviceName,
      stream:    'domain-events',
      eventId:   event.eventId,
      eventType: event.eventType,
      version:   event.eventVersion,
      producer:  event.producer,
      cid:       event.correlationId,
      ts:        event.occurredAt,
    }));
  });
}
