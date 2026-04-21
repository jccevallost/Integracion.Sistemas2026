// application/dtos/ServiceCatalogDto.ts
export interface CreateServiceCatalogDto {
  name: string;
  code: string;
  category: string;
  description?: string | null;
}

export interface UpdateServiceCatalogDto {
  name?: string;
  code?: string;
  category?: string;
  description?: string | null;
}

export interface ServiceCatalogResponseDto {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string | null;
}
