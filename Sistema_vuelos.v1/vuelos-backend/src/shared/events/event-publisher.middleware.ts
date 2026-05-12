import { Request, Response, NextFunction, RequestHandler } from 'express';
import { EventBus } from './EventBus.js';
import { DomainEvents } from './domain-events.js';

type EventRule = {
  method:        string;
  test:          (url: string) => boolean;
  successStatus: number;
  eventType:     string;
  producer:      string;
};

function createEventPublisher(rules: EventRule[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (res as any).json = function (body: unknown): Response {
      const matched = rules.find(
        (r) =>
          r.method === req.method &&
          r.test(req.originalUrl) &&
          res.statusCode === r.successStatus,
      );

      if (matched) {
        const payload =
          typeof body === 'object' && body !== null && 'data' in body
            ? (body as { data: unknown }).data
            : body;

        EventBus.publish({
          eventType:     matched.eventType,
          eventVersion:  1,
          producer:      matched.producer,
          correlationId: req.headers['x-correlation-id'] as string | undefined,
          payload,
        });
      }

      return originalJson(body);
    };

    next();
  };
}

export const bookingEventPublisher = createEventPublisher([
  {
    method:        'POST',
    test:          (url) => /\/api\/v1\/reservations$/.test(url),
    successStatus: 201,
    eventType:     DomainEvents.RESERVATION_CREATED,
    producer:      'booking-service',
  },
  {
    method:        'PATCH',
    test:          (url) => /\/reservations\/.+\/cancel/.test(url),
    successStatus: 200,
    eventType:     DomainEvents.RESERVATION_CANCELLED,
    producer:      'booking-service',
  },
  {
    method:        'PATCH',
    test:          (url) => /\/reservation-passengers\/.+\/seat/.test(url),
    successStatus: 200,
    eventType:     DomainEvents.SEAT_ASSIGNED,
    producer:      'booking-service',
  },
  {
    method:        'POST',
    test:          (url) => /\/api\/v1\/boarding-passes$/.test(url),
    successStatus: 201,
    eventType:     DomainEvents.CHECKIN_COMPLETED,
    producer:      'booking-service',
  },
]);

export const paymentsEventPublisher = createEventPublisher([
  {
    method:        'POST',
    test:          (url) => /\/api\/v1\/payments$/.test(url),
    successStatus: 201,
    eventType:     DomainEvents.PAYMENT_REGISTERED,
    producer:      'payments-service',
  },
  {
    method:        'POST',
    test:          (url) => /\/api\/v1\/invoices$/.test(url),
    successStatus: 201,
    eventType:     DomainEvents.INVOICE_ISSUED,
    producer:      'payments-service',
  },
  {
    method:        'POST',
    test:          (url) => /\/api\/v1\/passenger-services$/.test(url),
    successStatus: 201,
    eventType:     DomainEvents.ANCILLARY_ADDED,
    producer:      'payments-service',
  },
]);
