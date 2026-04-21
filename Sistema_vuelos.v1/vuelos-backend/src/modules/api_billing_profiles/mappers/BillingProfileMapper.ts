// application/mappers/BillingProfileMapper.ts
import { BillingProfile } from '../entities/BillingProfile.js';
import { BillingProfileResponseDto } from '../dtos/BillingProfileDto.js';

export class BillingProfileMapper {
  static toEntity(raw: any): BillingProfile {
    return new BillingProfile(
      raw.id,
      raw.userId,
      raw.taxId,
      raw.businessName,
      raw.email ?? null,
      raw.address,
      raw.cityId,
      raw.isDefault ?? false,
    );
  }

  static toDto(raw: any): BillingProfileResponseDto {
    return {
      id: raw.id,
      userId: raw.userId,
      taxId: raw.taxId,
      businessName: raw.businessName,
      email: raw.email ?? null,
      address: raw.address,
      cityId: raw.cityId,
      isDefault: raw.isDefault ?? false,
      city: raw.city ? { id: raw.city.id, name: raw.city.name } : undefined,
    };
  }

  static toDtoList(raws: any[]): BillingProfileResponseDto[] {
    return raws.map(this.toDto);
  }
}
