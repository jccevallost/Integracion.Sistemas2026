// domain/interfaces/repositories/IBoardingPassRepository.ts
import { BoardingPass } from '../entities/BoardingPass.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IBoardingPassRepository extends IBaseRepository<BoardingPass> {
  findByPassenger(passengerId: string): Promise<any[]>;
  findBySegment(segmentId: string): Promise<any[]>;
  findByCode(boardingCode: string): Promise<BoardingPass | null>;
  findAllWithRelations(): Promise<any[]>;
}
