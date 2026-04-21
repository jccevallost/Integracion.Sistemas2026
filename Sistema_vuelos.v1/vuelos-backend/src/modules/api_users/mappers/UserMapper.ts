// application/mappers/UserMapper.ts
import { User } from '../entities/User.js';
import { UserResponseDto } from '../dtos/UserDto.js';

export class UserMapper {
  static toEntity(raw: any): User {
    return new User(
      raw.id, raw.email, raw.passwordHash,
      raw.firstName, raw.secondName, raw.firstLastName, raw.secondLastName,
      raw.mainAddress, raw.secondaryAddress, raw.cityId,
      raw.phone, raw.birthDate, raw.role, raw.isActive,
      raw.createdAt, raw.updatedAt,
    );
  }

  static toDto(raw: any): UserResponseDto {
    return {
      id: raw.id,
      email: raw.email,
      firstName: raw.firstName,
      secondName: raw.secondName ?? null,
      firstLastName: raw.firstLastName,
      secondLastName: raw.secondLastName ?? null,
      phone: raw.phone ?? null,
      role: raw.role,
      isActive: raw.isActive,
      createdAt: raw.createdAt?.toISOString?.() ?? raw.createdAt,
      city: raw.city,
    };
  }

  // Sanitiza: nunca expone passwordHash
  static toPublicDto(raw: any) {
    const { passwordHash, ...safe } = raw;
    return safe;
  }
}
