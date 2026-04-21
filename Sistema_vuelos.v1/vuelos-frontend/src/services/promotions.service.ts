// src/services/promotions.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, Promotion, PromotionValidation } from '@/types/domain';

export const promotionsService = {
  validate: (code: string, amount: number) =>
    apiClient.post<ApiSuccess<PromotionValidation>>('/promotions/validate', { code, amount }),

  // Admin
  getAll: () =>
    apiClient.get<ApiSuccess<Promotion[]>>('/promotions'),

  create: (data: object) =>
    apiClient.post<ApiSuccess<Promotion>>('/promotions', data),

  update: (id: string, data: object) =>
    apiClient.put<ApiSuccess<Promotion>>(`/promotions/${id}`, data),

  remove: (id: string) =>
    apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/promotions/${id}`),
};
