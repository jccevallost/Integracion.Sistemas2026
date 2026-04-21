// src/services/flights.service.ts
// ============================================================
//   Servicio de vuelos — única capa que conoce los endpoints.
//   Reto 2: si el Flight MS cambia de puerto, solo cambia aquí.
//   Reto 3: React Native importa este mismo archivo.
// ============================================================
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, Flight, FlightSearchParams } from '@/types/domain';

export const flightsService = {
  search: (params: FlightSearchParams) =>
    apiClient.get<ApiSuccess<Flight[]>>('/flights/search', params),

  getAll: () =>
    apiClient.get<ApiSuccess<Flight[]>>('/flights'),

  getById: (id: string) =>
    apiClient.get<ApiSuccess<Flight>>(`/flights/${id}`),

  create: (data: object) =>
    apiClient.post<ApiSuccess<Flight>>('/flights', data),

  update: (id: string, data: object) =>
    apiClient.put<ApiSuccess<Flight>>(`/flights/${id}`, data),

  remove: (id: string) =>
    apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/flights/${id}`),
};
