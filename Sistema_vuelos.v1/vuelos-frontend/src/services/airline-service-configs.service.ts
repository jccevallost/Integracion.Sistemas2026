// src/services/airline-service-configs.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess } from '@/types/domain';

export interface AirlineServiceConfig {
  id: string;
  serviceId: string;
  airlineId: string;
  price: number;
  currency: string;
  service?: { id: string; name: string; code: string; category: string };
  airline?: { id: string; name: string; iataCode: string };
}

export const airlineServiceConfigsService = {
  byAirline: (airlineId: string) =>
    apiClient.get<ApiSuccess<AirlineServiceConfig[]>>(`/airline-service-configs/by-airline/${airlineId}`),

  list: () =>
    apiClient.get<ApiSuccess<AirlineServiceConfig[]>>('/airline-service-configs'),
};
