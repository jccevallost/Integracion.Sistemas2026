// domain/interfaces/services/ISegmentService.ts
export interface ISegmentService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  findByFlight(flightId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
