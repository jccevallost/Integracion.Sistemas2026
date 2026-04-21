// application/dtos/PromotionDto.ts
export interface CreatePromotionDto {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  isActive?: boolean;
  maxUsages?: number;
}

export interface UpdatePromotionDto {
  code?: string;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  isActive?: boolean;
  maxUsages?: number;
}

export interface PromotionResponseDto {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  maxUsages: number | null;
  currentUsages: number;
}

export interface ValidatePromotionResponseDto {
  valid: boolean;
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}
