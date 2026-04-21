// application/dtos/BillingProfileDto.ts
export interface CreateBillingProfileDto {
  userId: string;
  taxId: string;
  businessName: string;
  email?: string | null;
  address: string;
  cityId: string;
  isDefault?: boolean;
}

export interface UpdateBillingProfileDto {
  taxId?: string;
  businessName?: string;
  email?: string | null;
  address?: string;
  cityId?: string;
  isDefault?: boolean;
}

export interface BillingProfileResponseDto {
  id: string;
  userId: string;
  taxId: string;
  businessName: string;
  email: string | null;
  address: string;
  cityId: string;
  isDefault: boolean;
  city?: { id: string; name: string };
}
