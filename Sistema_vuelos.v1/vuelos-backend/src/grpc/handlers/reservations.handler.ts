import type { ReservationService } from '../../modules/api_reservations/services/ReservationService.js';
import { verifyServiceToken } from '../auth-helper.js';
import { toGrpcError } from '../error-mapper.js';

export function createReservationHandlers(reservationService: ReservationService) {
  return {
    async CreateReservation(call: any, callback: any) {
      try {
        await verifyServiceToken(call.metadata);
        const { flight_class_id, passengers, promotion_code, user_id } = call.request;
        const result = await reservationService.create(user_id, {
          flightClassId: flight_class_id,
          passengers: (passengers ?? []).map((p: any) => ({
            firstName: p.first_name,
            lastName: p.last_name,
            documentNumber: p.document_number,
            seatNumber: p.seat_number || undefined,
          })),
          promotionCode: promotion_code || undefined,
        });
        callback(null, { success: true, reservation: mapReservation(result) });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },

    async GetReservation(call: any, callback: any) {
      try {
        const caller = await verifyServiceToken(call.metadata);
        const { id, user_id } = call.request;
        const effectiveUserId = user_id || caller.id;
        const isAdmin = caller.role === 'ADMIN' || caller.role === 'SERVICE';
        const result = await reservationService.getById(id, effectiveUserId, isAdmin);
        callback(null, { success: true, reservation: mapReservation(result) });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },

    async CancelReservation(call: any, callback: any) {
      try {
        const caller = await verifyServiceToken(call.metadata);
        const { id, user_id } = call.request;
        const effectiveUserId = user_id || caller.id;
        const isAdmin = caller.role === 'ADMIN' || caller.role === 'SERVICE';
        const result = await reservationService.cancel(id, effectiveUserId, isAdmin);
        callback(null, { success: true, reservation_code: result.reservationCode });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },

    async ListReservations(call: any, callback: any) {
      try {
        await verifyServiceToken(call.metadata);
        const { user_id } = call.request;
        const results = user_id
          ? await reservationService.getMyReservations(user_id)
          : await reservationService.listAll();
        callback(null, {
          success: true,
          reservations: (results as any[]).map(mapReservation),
        });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },
  };
}

function mapReservation(r: any) {
  return {
    id: r.id ?? '',
    reservation_code: r.reservationCode ?? '',
    status: r.status ?? '',
    total_amount: r.totalAmount ? Number(r.totalAmount) : 0,
    created_at: r.createdAt ? String(r.createdAt) : '',
    flight_id: r.flightId ?? '',
    user_id: r.userId ?? '',
    passengers: (r.passengers ?? []).map((p: any) => ({
      id: p.id ?? '',
      first_name: p.firstName ?? '',
      last_name: p.lastName ?? '',
      document_number: p.documentNumber ?? '',
      seat_number: p.seatNumber ?? '',
      cabin_class: p.flightClass?.cabinClass ?? p.cabinClass ?? '',
    })),
  };
}
