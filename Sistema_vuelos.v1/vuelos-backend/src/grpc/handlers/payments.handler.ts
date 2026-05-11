import type { PaymentService } from '../../modules/api_payments/services/PaymentService.js';
import { verifyServiceToken } from '../auth-helper.js';
import { toGrpcError } from '../error-mapper.js';

export function createPaymentHandlers(paymentService: PaymentService) {
  return {
    async ProcessPayment(call: any, callback: any) {
      try {
        const caller = await verifyServiceToken(call.metadata);
        const { reservation_id, amount, provider, user_id } = call.request;
        const effectiveUserId = user_id || caller.id;
        const payment = await paymentService.create(
          { reservationId: reservation_id, amount, provider },
          effectiveUserId,
        );
        callback(null, { success: true, payment: mapPayment(payment) });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },

    async GetPaymentByReservation(call: any, callback: any) {
      try {
        await verifyServiceToken(call.metadata);
        const payment = await paymentService.findByReservation(call.request.reservation_id);
        callback(null, { success: true, payment: payment ? mapPayment(payment) : null });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },
  };
}

function mapPayment(p: any) {
  return {
    id: p.id ?? '',
    reservation_id: p.reservationId ?? '',
    amount: p.amount ? Number(p.amount) : 0,
    provider: p.provider ?? '',
    transaction_id: p.transactionId ?? '',
    status: p.status ?? '',
    created_at: p.createdAt ? String(p.createdAt) : '',
  };
}
