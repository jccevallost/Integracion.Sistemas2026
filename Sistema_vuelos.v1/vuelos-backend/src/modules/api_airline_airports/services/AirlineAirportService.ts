// application/services/AirlineAirportService.ts
import { IAirlineAirportService } from '../interfaces/IAirlineAirportService.js';
import { IAirlineAirportRepository } from '../interfaces/IAirlineAirportRepository.js';

export class AirlineAirportService implements IAirlineAirportService {
  constructor(private readonly repo: IAirlineAirportRepository) {}

  async listAll() { return this.repo.findAll(); }

  async findByAirline(airlineId: string) { return this.repo.findByAirline(airlineId); }

  async findByAirport(airportId: string) { return this.repo.findByAirport(airportId); }

  async create(data: { airlineId: string; airportId: string }) {
    return this.repo.create(data);
  }

  async remove(airlineId: string, airportId: string) {
    await this.repo.delete(airlineId, airportId);
  }
}
