export const DomainEvents = {
  RESERVATION_CREATED:   'ReservationCreated',
  RESERVATION_CANCELLED: 'ReservationCancelled',
  SEAT_ASSIGNED:         'SeatAssigned',
  CHECKIN_COMPLETED:     'CheckInCompleted',
  PAYMENT_REGISTERED:    'PaymentRegistered',
  INVOICE_ISSUED:        'InvoiceIssued',
  ANCILLARY_ADDED:       'AncillaryAdded',
} as const;

export type DomainEventType = (typeof DomainEvents)[keyof typeof DomainEvents];

export interface ReservationCreatedPayload {
  reservationId: string;
  reservationCode?: string;
  userId: string;
  totalAmount?: number;
}

export interface ReservationCancelledPayload {
  reservationId: string;
  reason?: string;
}

export interface PaymentRegisteredPayload {
  paymentId: string;
  reservationId: string;
  amount?: number;
  status?: string;
}

export interface InvoiceIssuedPayload {
  invoiceId: string;
  paymentId?: string;
  totalAmount?: number;
}

export interface AncillaryAddedPayload {
  passengerServiceId: string;
  passengerId?: string;
  amount?: number;
}
