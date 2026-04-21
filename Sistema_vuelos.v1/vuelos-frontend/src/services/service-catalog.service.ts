// src/services/service-catalog.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, ServiceCatalog } from '@/types/domain';

export const serviceCatalogService = {
  getAll: () =>
    apiClient.get<ApiSuccess<ServiceCatalog[]>>('/service-catalog'),

  getById: (id: string) =>
    apiClient.get<ApiSuccess<ServiceCatalog>>(`/service-catalog/${id}`),
};
