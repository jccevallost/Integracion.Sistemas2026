// src/services/reservations.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, Reservation, Passenger } from '@/types/domain';

export interface CreateReservationPayload {
  flightClassId: string;
  passengers: Omit<Passenger, 'id' | 'seatNumber'>[];
  promotionCode?: string;
}

export const reservationsService = {
  create: (payload: CreateReservationPayload) =>
    apiClient.post<ApiSuccess<Reservation>>('/reservations', payload),

  myReservations: () =>
    apiClient.get<ApiSuccess<Reservation[]>>('/reservations/my'),

  getById: (id: string) =>
    apiClient.get<ApiSuccess<Reservation>>(`/reservations/${id}`),

  cancel: (id: string) =>
    apiClient.delete<ApiSuccess<{ cancelled: boolean; reservationCode: string }>>(`/reservations/${id}`),

  // Admin
  listAll: () =>
    apiClient.get<ApiSuccess<Reservation[]>>('/reservations'),
};
