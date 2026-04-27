// domain/interfaces/services/IAirlineServiceConfigService.ts
export interface IAirlineServiceConfigService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  findByAirline(airlineId: string): Promise<any[]>;
  findAvailableForRoute(airlineId: string, originAirportId?: string, destAirportId?: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
