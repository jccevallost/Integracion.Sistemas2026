// domain/interfaces/repositories/IReservationPassengerRepository.ts
import { ReservationPassenger } from '../entities/ReservationPassenger.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IReservationPassengerRepository extends IBaseRepository<ReservationPassenger> {
  findByReservation(reservationId: string): Promise<any[]>;
  findAllWithRelations(): Promise<any[]>;
  findSeatConflict(flightClassId: string, seatNumber: string, excludePassengerId?: string): Promise<any | null>;
}
