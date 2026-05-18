// domain/interfaces/repositories/IReservationRepository.ts
import { Reservation } from '../entities/Reservation.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IReservationRepository extends IBaseRepository<Reservation> {
  findByUserId(userId: string): Promise<any[]>;
  findByIdWithRelations(id: string): Promise<any | null>;
  findAllWithRelations(): Promise<any[]>;
  updateStatus(id: string, status: string): Promise<void>;
  /** Cancels reservation and clears seat numbers. Seat/promo restoration happens via HTTP in ReservationService. */
  cancelAndRestoreSeats(id: string): Promise<void>;
}
