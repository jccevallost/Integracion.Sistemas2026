// src/services/passenger-services.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, PassengerService } from '@/types/domain';

export interface CreatePassengerServicePayload {
  passengerId:        string;
  serviceConfigId:    string;
  quantity:           number;
  unitPriceAtBooking: number;
}

export const passengerServicesService = {
  byPassenger: (passengerId: string) =>
    apiClient.get<ApiSuccess<PassengerService[]>>(`/passenger-services/by-passenger/${passengerId}`),

  create: (payload: CreatePassengerServicePayload) =>
    apiClient.post<ApiSuccess<PassengerService>>('/passenger-services', payload),

  remove: (id: string) =>
    apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/passenger-services/${id}`),
};
