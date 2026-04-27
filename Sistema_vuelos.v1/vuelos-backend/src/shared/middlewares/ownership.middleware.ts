import type { NextFunction, Request, Response } from 'express';
import type { PrismaClient } from '@prisma/client';

type IdGetter = (req: Request) => unknown;

function isAdmin(req: Request): boolean {
  return req.user?.role === 'ADMIN';
}

function userId(req: Request): string | undefined {
  return req.user?.id;
}

function deny(res: Response, status: number, code: string, message: string): void {
  res.status(status).json({ success: false, error: { code, message } });
}

function missingId(res: Response): void {
  deny(res, 400, 'VALIDATION_ERROR', 'Identificador requerido');
}

function normalizeId(value: unknown): string | undefined {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : undefined;
  if (value === undefined || value === null || value === '') return undefined;
  return String(value);
}

async function assertReservationOwner(db: PrismaClient, req: Request, res: Response, reservationId: string): Promise<boolean> {
  const reservation = await db.reservation.findUnique({
    where: { id: reservationId },
    select: { id: true, userId: true, status: true, totalAmount: true },
  });
  if (!reservation) {
    deny(res, 404, 'NOT_FOUND', 'Reserva no encontrada');
    return false;
  }
  if (!isAdmin(req) && reservation.userId !== userId(req)) {
    deny(res, 403, 'FORBIDDEN', 'Sin permisos para esta reserva');
    return false;
  }
  return true;
}

export function requireReservationOwner(db: PrismaClient, getId: IdGetter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = normalizeId(getId(req));
      if (!id) return missingId(res);
      if (await assertReservationOwner(db, req, res, id)) next();
    } catch (err) { next(err); }
  };
}

export function requirePassengerOwner(db: PrismaClient, getId: IdGetter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = normalizeId(getId(req));
      if (!id) return missingId(res);
      const passenger = await db.reservationPassenger.findUnique({
        where: { id },
        include: { reservation: { select: { userId: true } } },
      });
      if (!passenger) return deny(res, 404, 'NOT_FOUND', 'Pasajero no encontrado');
      if (!isAdmin(req) && passenger.reservation.userId !== userId(req)) {
        return deny(res, 403, 'FORBIDDEN', 'Sin permisos para este pasajero');
      }
      next();
    } catch (err) { next(err); }
  };
}

export function requireBillingProfileOwner(db: PrismaClient, getId: IdGetter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = normalizeId(getId(req));
      if (!id) return missingId(res);
      const profile = await db.billingProfile.findUnique({ where: { id }, select: { userId: true } });
      if (!profile) return deny(res, 404, 'NOT_FOUND', 'Perfil de facturacion no encontrado');
      if (!isAdmin(req) && profile.userId !== userId(req)) {
        return deny(res, 403, 'FORBIDDEN', 'Sin permisos para este perfil de facturacion');
      }
      next();
    } catch (err) { next(err); }
  };
}

export function requirePaymentOwner(db: PrismaClient, getId: IdGetter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = normalizeId(getId(req));
      if (!id) return missingId(res);
      const payment = await db.payment.findUnique({
        where: { id },
        include: { reservation: { select: { userId: true } } },
      });
      if (!payment) return deny(res, 404, 'NOT_FOUND', 'Pago no encontrado');
      if (!isAdmin(req) && payment.reservation.userId !== userId(req)) {
        return deny(res, 403, 'FORBIDDEN', 'Sin permisos para este pago');
      }
      next();
    } catch (err) { next(err); }
  };
}

export function requireInvoiceOwner(db: PrismaClient, getId: IdGetter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = normalizeId(getId(req));
      if (!id) return missingId(res);
      const invoice = await db.invoice.findUnique({
        where: { id },
        include: {
          billingProfile: { select: { userId: true } },
          payment: { include: { reservation: { select: { userId: true } } } },
        },
      });
      if (!invoice) return deny(res, 404, 'NOT_FOUND', 'Factura no encontrada');
      const ownerId = invoice.billingProfile?.userId ?? invoice.payment?.reservation?.userId;
      if (!isAdmin(req) && ownerId !== userId(req)) {
        return deny(res, 403, 'FORBIDDEN', 'Sin permisos para esta factura');
      }
      next();
    } catch (err) { next(err); }
  };
}

export function requirePaymentOwnerForInvoice(db: PrismaClient, getPaymentId: IdGetter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentId = normalizeId(getPaymentId(req));
      if (!paymentId) return missingId(res);
      const payment = await db.payment.findUnique({
        where: { id: paymentId },
        include: { reservation: { select: { userId: true } } },
      });
      if (!payment) return deny(res, 404, 'NOT_FOUND', 'Pago no encontrado');
      if (!isAdmin(req) && payment.reservation.userId !== userId(req)) {
        return deny(res, 403, 'FORBIDDEN', 'Sin permisos para este pago');
      }
      next();
    } catch (err) { next(err); }
  };
}

export function requireInvoiceItemOwner(db: PrismaClient, getId: IdGetter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = normalizeId(getId(req));
      if (!id) return missingId(res);
      const item = await db.invoiceItem.findUnique({
        where: { id },
        include: { invoice: { include: { billingProfile: { select: { userId: true } } } } },
      });
      if (!item) return deny(res, 404, 'NOT_FOUND', 'Item de factura no encontrado');
      if (!isAdmin(req) && item.invoice.billingProfile.userId !== userId(req)) {
        return deny(res, 403, 'FORBIDDEN', 'Sin permisos para este item de factura');
      }
      next();
    } catch (err) { next(err); }
  };
}

export function requireInvoiceOwnerById(db: PrismaClient, getInvoiceId: IdGetter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invoiceId = normalizeId(getInvoiceId(req));
      if (!invoiceId) return missingId(res);
      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
        include: { billingProfile: { select: { userId: true } } },
      });
      if (!invoice) return deny(res, 404, 'NOT_FOUND', 'Factura no encontrada');
      if (!isAdmin(req) && invoice.billingProfile.userId !== userId(req)) {
        return deny(res, 403, 'FORBIDDEN', 'Sin permisos para esta factura');
      }
      next();
    } catch (err) { next(err); }
  };
}

export function requireBoardingPassOwner(db: PrismaClient, getId: IdGetter) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = normalizeId(getId(req));
      if (!id) return missingId(res);
      const boardingPass = await db.boardingPass.findUnique({
        where: { id },
        include: { passenger: { include: { reservation: { select: { userId: true } } } } },
      });
      if (!boardingPass) return deny(res, 404, 'NOT_FOUND', 'Pase de abordar no encontrado');
      if (!isAdmin(req) && boardingPass.passenger.reservation.userId !== userId(req)) {
        return deny(res, 403, 'FORBIDDEN', 'Sin permisos para este pase de abordar');
      }
      next();
    } catch (err) { next(err); }
  };
}

export function requireBoardingPassCreateAllowed(db: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const passengerId = String((req.body as any).passengerId ?? '');
      const segmentId = String((req.body as any).segmentId ?? '');
      if (!passengerId || !segmentId) return missingId(res);

      const passenger = await db.reservationPassenger.findUnique({
        where: { id: passengerId },
        include: { reservation: { include: { flight: { include: { segments: { select: { id: true } } } } } } },
      });
      if (!passenger) return deny(res, 404, 'NOT_FOUND', 'Pasajero no encontrado');
      if (!isAdmin(req) && passenger.reservation.userId !== userId(req)) {
        return deny(res, 403, 'FORBIDDEN', 'Sin permisos para este pasajero');
      }
      const segmentBelongsToReservation = passenger.reservation.flight.segments.some(s => s.id === segmentId);
      if (!segmentBelongsToReservation) {
        return deny(res, 400, 'VALIDATION_ERROR', 'El segmento no pertenece al vuelo de la reserva');
      }
      next();
    } catch (err) { next(err); }
  };
}

export function prepareBillingProfileWrite() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!isAdmin(req)) (req.body as any).userId = userId(req);
    next();
  };
}

export function prepareCustomerPayment(db: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reservationId = String((req.body as any).reservationId ?? '');
      if (!reservationId) return missingId(res);
      const reservation = await db.reservation.findUnique({
        where: { id: reservationId },
        select: { userId: true, totalAmount: true, status: true },
      });
      if (!reservation) return deny(res, 404, 'NOT_FOUND', 'Reserva no encontrada');
      if (!isAdmin(req) && reservation.userId !== userId(req)) {
        return deny(res, 403, 'FORBIDDEN', 'Sin permisos para pagar esta reserva');
      }
      if (reservation.status === 'CANCELLED') {
        return deny(res, 400, 'VALIDATION_ERROR', 'No se puede pagar una reserva cancelada');
      }
      if (!isAdmin(req)) (req.body as any).amount = Number(reservation.totalAmount);
      (req.body as any).status = (req.body as any).status ?? 'COMPLETED';
      next();
    } catch (err) { next(err); }
  };
}
