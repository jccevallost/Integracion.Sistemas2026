// domain/interfaces/repositories/IPaymentRepository.ts
import { Payment } from '../entities/Payment.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IPaymentRepository extends IBaseRepository<Payment> {
  findByReservation(reservationId: string): Promise<any[]>;
  findByTransaction(transactionId: string): Promise<Payment | null>;
  findAllWithRelations(): Promise<any[]>;
}
