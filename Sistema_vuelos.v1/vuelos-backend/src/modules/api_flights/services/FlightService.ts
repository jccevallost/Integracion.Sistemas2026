// application/services/FlightService.ts
import { IFlightService } from '../interfaces/IFlightService.js';
import { IFlightRepository } from '../interfaces/IFlightRepository.js';
import { FlightMapper } from '../mappers/FlightMapper.js';
import { ValidationException, NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class FlightService implements IFlightService {
  constructor(private readonly flightRepository: IFlightRepository) {}

  async listAll() {
    const flights = await this.flightRepository.findAllWithRelations();
    return FlightMapper.toDtoList(flights);
  }

  async search(origin: string, destination: string, date: string, passengers?: number, cabinClass?: string) {
    if (!origin || !destination || !date) {
      throw new ValidationException('origin, destination y date son requeridos');
    }

    const searchDate = new Date(date);
    const flights = await this.flightRepository.search({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      date: searchDate,
      passengers,
      cabinClass,
    });

    return flights
      .filter((f: any) => f.flightClasses?.length > 0)
      .map((f: any) => FlightMapper.toDto(f));
  }

  async getById(id: string) {
    const flight = await this.flightRepository.findByIdWithRelations(id);
    if (!flight) throw new NotFoundException('Vuelo', id);
    return FlightMapper.toDto(flight);
  }

  async create(data: any) {
    if (!data.originAirportIata || !data.destinationAirportIata || !data.departureDate) {
      throw new ValidationException('originAirportIata, destinationAirportIata y departureDate son requeridos');
    }
    return this.flightRepository.create(data);
  }

  async update(id: string, data: any) {
    const existing = await this.flightRepository.findById(id);
    if (!existing) throw new NotFoundException('Vuelo', id);
    return this.flightRepository.update(id, data);
  }

  async remove(id: string) {
    const existing = await this.flightRepository.findById(id);
    if (!existing) throw new NotFoundException('Vuelo', id);

    const hasReservations = await this.flightRepository.hasReservations(id);
    if (hasReservations) {
      throw new ValidationException('No se puede eliminar un vuelo con reservas existentes');
    }

    await this.flightRepository.delete(id);
  }
}
