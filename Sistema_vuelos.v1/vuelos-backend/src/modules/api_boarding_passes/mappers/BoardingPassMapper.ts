// application/mappers/BoardingPassMapper.ts
import { BoardingPass } from '../entities/BoardingPass.js';
import { BoardingPassResponseDto } from '../dtos/BoardingPassDto.js';

export class BoardingPassMapper {
  static toEntity(raw: any): BoardingPass {
    return new BoardingPass(
      raw.id,
      raw.passengerId,
      raw.segmentId,
      raw.boardingCode,
      raw.gate ?? null,
      raw.boardingGroup ?? null,
      raw.checkInAt ? new Date(raw.checkInAt) : null,
      raw.status ?? 'NOT_CHECKED_IN',
    );
  }

  static toDto(raw: any): BoardingPassResponseDto {
    return {
      id: raw.id,
      passengerId: raw.passengerId,
      segmentId: raw.segmentId,
      boardingCode: raw.boardingCode,
      gate: raw.gate ?? null,
      boardingGroup: raw.boardingGroup ?? null,
      checkInAt: raw.checkInAt?.toISOString?.() ?? raw.checkInAt ?? null,
      status: raw.status,
      passenger: raw.passenger
        ? { id: raw.passenger.id, firstName: raw.passenger.firstName, lastName: raw.passenger.lastName, documentNumber: raw.passenger.documentNumber }
        : undefined,
      segment: raw.segment
        ? { id: raw.segment.id, segmentNumber: raw.segment.segmentNumber }
        : undefined,
    };
  }

  static toDtoList(raws: any[]): BoardingPassResponseDto[] {
    return raws.map(this.toDto);
  }
}
