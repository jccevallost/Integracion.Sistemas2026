import type { ReservationPassengerService } from '../../modules/api_reservation_passengers/services/ReservationPassengerService.js';
import { verifyServiceToken } from '../auth-helper.js';
import { toGrpcError } from '../error-mapper.js';

export function createPassengerHandlers(reservationPassengerService: ReservationPassengerService) {
  return {
    async GetPassengersByReservation(call: any, callback: any) {
      try {
        await verifyServiceToken(call.metadata);
        const passengers = await reservationPassengerService.findByReservation(
          call.request.reservation_id,
        );
        callback(null, {
          success: true,
          passengers: (passengers as any[]).map((p) => ({
            id: p.id ?? '',
            reservation_id: p.reservationId ?? '',
            first_name: p.firstName ?? '',
            last_name: p.lastName ?? '',
            document_number: p.documentNumber ?? '',
            seat_number: p.seatNumber ?? '',
            cabin_class: p.flightClass?.cabinClass ?? '',
          })),
        });
      } catch (err) {
        callback(toGrpcError(err));
      }
    },
  };
}
