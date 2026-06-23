// presentation/routes/reservations.routes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { ReservationController } from '../controllers/ReservationController.js';
import { authenticate, authenticateOptional, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreateReservationSchema } from '../../../shared/schemas/validation.schemas.js';

function isUniqueSeatConflict(err: any) {
  return err?.code === 'P2002'
    || String(err?.message ?? '').includes('reservation_passengers_flight_class_seat_unique');
}

export function createReservationRouter(controller: ReservationController, db: PrismaClient): Router {
  const router = Router();
  router.post('/',             authenticateOptional, validate(CreateReservationSchema), controller.create);
  router.post('/checkout',     authenticateOptional, validate(CreateReservationSchema), controller.create);
  router.get('/my',            authenticate, controller.myReservations);
  router.get('/',              authenticate, requireAdmin, controller.listAll);
  router.get('/flight-classes/:flightClassId/occupied-seats', async (req: any, res: any, next: any) => {
    try {
      const seats = await db.reservationPassenger.findMany({
        where: {
          flightClassId: String(req.params.flightClassId),
          seatNumber: { not: null },
          reservation: { status: { not: 'CANCELLED' } },
        },
        select: { seatNumber: true },
        orderBy: { seatNumber: 'asc' },
      });

      const occupiedSeats = Array.from(new Set(
        seats
          .map((seat) => seat.seatNumber?.trim().toUpperCase())
          .filter((seat): seat is string => Boolean(seat)),
      ));

      res.json({
        success: true,
        data: occupiedSeats,
      });
    } catch (err) { next(err); }
  });
  router.get('/:id',           authenticate, controller.getById);
  // ⚠️ SOLO PRUEBAS: cancelar no exige token (authenticateOptional).
  // Si llega token se valida el dueño; sin token se permite (modo prueba).
  // Para producción volver a 'authenticate' en ambas rutas.
  router.delete('/:id',        authenticateOptional, controller.cancel);
  // Angular service calls PATCH /cancel — keep in sync with DELETE /:id
  router.patch('/:id/cancel',  authenticateOptional, controller.cancel);

  // ── Asignación de asiento durante check-in ───────────────────
  router.patch('/:id/passengers/:passengerId/seat', authenticate, async (req: any, res: any, next: any) => {
    try {
      const { id, passengerId } = req.params;
      const { seatNumber } = req.body;

      if (!seatNumber || typeof seatNumber !== 'string' || seatNumber.trim().length === 0) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'seatNumber es requerido' } });
        return;
      }
      const seat = seatNumber.trim().toUpperCase();

      const reservation = await db.reservation.findUnique({
        where: { id },
        include: { passengers: true },
      });
      if (!reservation) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' } });
        return;
      }

      const userId  = req.user?.id;
      const isAdmin = req.user?.role === 'ADMIN';
      if (reservation.userId !== userId && !isAdmin) {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Sin permisos' } });
        return;
      }

      const passenger = (reservation.passengers as any[]).find((p: any) => p.id === passengerId);
      if (!passenger) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Pasajero no encontrado en esta reserva' } });
        return;
      }

      // Verificar que el asiento no esté ocupado por otro pasajero del mismo vuelo+clase
      const seatTaken = await db.reservationPassenger.findFirst({
        where: {
          flightClassId: passenger.flightClassId,
          seatNumber: seat,
          id: { not: passengerId },
          reservation: { status: { not: 'CANCELLED' } },
        },
      });
      if (seatTaken) {
        res.status(409).json({ success: false, error: { code: 'CONFLICT', message: `El asiento ${seat} ya está ocupado. Elige otro.` } });
        return;
      }

      const updated = await db.reservationPassenger.update({
        where: { id: passengerId },
        data: { seatNumber: seat },
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      if (isUniqueSeatConflict(err)) {
        res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Ese asiento acaba de ocuparse. Actualiza el mapa y elige otro.' } });
        return;
      }
      next(err);
    }
  });

  return router;
}
