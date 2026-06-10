import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CreatePaymentSchema,
  CreateReservationSchema,
  RegisterSchema,
} from '../src/shared/schemas/validation.schemas.ts';

describe('validation schemas', () => {
  it('accepts a valid mobile registration payload', () => {
    const parsed = RegisterSchema.parse({
      email: 'cliente@example.com',
      password: 'secret123',
      firstName: 'Ana',
      firstLastName: 'Lopez',
      mainAddress: 'Av. Principal',
      phone: '0999999999',
    });

    assert.equal(parsed.email, 'cliente@example.com');
    assert.equal(parsed.firstName, 'Ana');
  });

  it('requires at least one passenger when creating a reservation', () => {
    const result = CreateReservationSchema.safeParse({
      flightClassId: '550e8400-e29b-41d4-a716-446655440000',
      passengers: [],
    });

    assert.equal(result.success, false);
  });

  it('accepts the booking v2 reservation contract with external references', () => {
    const parsed = CreateReservationSchema.parse({
      flightClassId: '550e8400-e29b-41d4-a716-446655440000',
      passengers: [
        {
          firstName: 'Ana',
          lastName: 'Lopez',
          documentNumber: '0955555555',
          seatNumber: '14C',
        },
      ],
      promotionCode: 'VERANO20',
      idCarrito: 'booking-cart-123',
      metodoPagoId: 'booking-payment-method-456',
      currency: 'USD',
    });

    assert.equal(parsed.idCarrito, 'booking-cart-123');
    assert.equal(parsed.metodoPagoId, 'booking-payment-method-456');
    assert.equal(parsed.currency, 'USD');
  });

  it('accepts the mobile payment contract', () => {
    const parsed = CreatePaymentSchema.parse({
      reservationId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 125.5,
      provider: 'VISA',
      transactionId: 'MOB-123456789',
      status: 'COMPLETED',
    });

    assert.equal(parsed.provider, 'VISA');
    assert.equal(parsed.status, 'COMPLETED');
  });

  it('rejects unsupported payment providers', () => {
    const result = CreatePaymentSchema.safeParse({
      reservationId: '550e8400-e29b-41d4-a716-446655440001',
      amount: 125.5,
      provider: 'CASH',
      transactionId: 'MOB-123456789',
    });

    assert.equal(result.success, false);
  });
});
