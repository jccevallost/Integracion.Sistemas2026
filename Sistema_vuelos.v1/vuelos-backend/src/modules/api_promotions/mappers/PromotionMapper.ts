// application/mappers/PromotionMapper.ts
import { Promotion } from '../entities/Promotion.js';
import { PromotionResponseDto } from '../dtos/PromotionDto.js';

export class PromotionMapper {
  static toEntity(raw: any): Promotion {
    return new Promotion(
      raw.id,
      raw.code,
      raw.discountType,
      Number(raw.discountValue),
      raw.isActive ?? true,
    );
  }

  static toDto(raw: any): PromotionResponseDto {
    return {
      id: raw.id,
      code: raw.code,
      discountType: raw.discountType,
      discountValue: Number(raw.discountValue),
      maxUsages: raw.maxUsages ?? null,
      currentUsages: raw.currentUsages ?? 0,
      isActive: raw.isActive ?? true,
    };
  }

  static toDtoList(raws: any[]): PromotionResponseDto[] {
    return raws.map(this.toDto);
  }
}
