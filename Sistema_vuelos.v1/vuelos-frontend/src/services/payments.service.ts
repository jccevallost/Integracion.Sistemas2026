// src/services/payments.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, Payment } from '@/types/domain';

export interface CreatePaymentPayload {
  reservationId: string;
  amount: number;
  provider: string;
  transactionId?: string;
}

export const paymentsService = {
  create: (payload: CreatePaymentPayload) =>
    apiClient.post<ApiSuccess<Payment>>('/payments', payload),

  byReservation: (reservationId: string) =>
    apiClient.get<ApiSuccess<Payment[]>>(`/payments/by-reservation/${reservationId}`),

  getById: (id: string) =>
    apiClient.get<ApiSuccess<Payment>>(`/payments/${id}`),

  listAll: () =>
    apiClient.get<ApiSuccess<Payment[]>>('/payments'),
};
