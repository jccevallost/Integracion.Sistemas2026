// domain/interfaces/repositories/ISegmentRepository.ts
import { Segment } from '../entities/Segment.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface ISegmentRepository extends IBaseRepository<Segment> {
  findByFlight(flightId: string): Promise<any[]>;
  findAllWithRelations(): Promise<any[]>;
}
