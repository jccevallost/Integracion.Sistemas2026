// application/services/FlightClassService.ts
import { IFlightClassService } from '../interfaces/IFlightClassService.js';
import { IFlightClassRepository } from '../interfaces/IFlightClassRepository.js';
import { NotFoundException, NoAvailabilityException } from '../../../shared/exceptions/BusinessException.js';

export class FlightClassService implements IFlightClassService {
  constructor(private readonly repo: IFlightClassRepository) {}

  async listAll() { return (await this.repo.findAll()).data; }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Clase de vuelo', id);
    return item;
  }

  async findByFlight(flightId: string) { return this.repo.findByFlightId(flightId); }

  async create(data: any) { return this.repo.create(data); }

  async update(id: string, data: any) {
    await this.getById(id);
    return this.repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }

  async decrementSeats(id: string, count: number): Promise<void> {
    const ok = await this.repo.decrementSeatsAtomic(id, count);
    if (!ok) throw new NoAvailabilityException(`Solo quedan asientos insuficientes para la clase ${id}`);
  }

  async incrementSeats(id: string, count: number): Promise<void> {
    await this.repo.incrementSeats(id, count);
  }
}
