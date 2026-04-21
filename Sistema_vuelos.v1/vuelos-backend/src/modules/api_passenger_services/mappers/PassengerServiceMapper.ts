// application/mappers/PassengerServiceMapper.ts
import { PassengerService } from '../entities/PassengerService.js';
import { PassengerServiceResponseDto } from '../dtos/PassengerServiceDto.js';

export class PassengerServiceMapper {
  static toEntity(raw: any): PassengerService {
    return new PassengerService(
      raw.id,
      raw.passengerId,
      raw.serviceConfigId,
      raw.quantity,
      Number(raw.unitPriceAtBooking),
    );
  }

  static toDto(raw: any): PassengerServiceResponseDto {
    return {
      id: raw.id,
      passengerId: raw.passengerId,
      serviceConfigId: raw.serviceConfigId,
      quantity: raw.quantity,
      unitPriceAtBooking: Number(raw.unitPriceAtBooking),
      totalPrice: Number(raw.unitPriceAtBooking) * raw.quantity,
      passenger: raw.passenger
        ? { id: raw.passenger.id, firstName: raw.passenger.firstName, lastName: raw.passenger.lastName }
        : undefined,
      serviceConfig: raw.serviceConfig
        ? {
            id: raw.serviceConfig.id,
            price: Number(raw.serviceConfig.price),
            currency: raw.serviceConfig.currency,
            service: raw.serviceConfig.service
              ? { name: raw.serviceConfig.service.name, code: raw.serviceConfig.service.code }
              : undefined,
          }
        : undefined,
    };
  }

  static toDtoList(raws: any[]): PassengerServiceResponseDto[] {
    return raws.map(this.toDto);
  }
}
