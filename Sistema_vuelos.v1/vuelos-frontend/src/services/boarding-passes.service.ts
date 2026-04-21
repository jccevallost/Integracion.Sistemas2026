// src/services/boarding-passes.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, BoardingPass } from '@/types/domain';

export interface CreateBoardingPassPayload {
  passengerId:   string;
  segmentId:     string;
  boardingCode:  string;
  gate?:         string | null;
  boardingGroup?: string | null;
  checkInAt?:    string | null;
  status?:       'NOT_CHECKED_IN' | 'CHECKED_IN' | 'BOARDED' | 'NO_SHOW';
}

export const boardingPassesService = {
  byPassenger: (passengerId: string) =>
    apiClient.get<ApiSuccess<BoardingPass[]>>(`/boarding-passes/by-passenger/${passengerId}`),

  create: (payload: CreateBoardingPassPayload) =>
    apiClient.post<ApiSuccess<BoardingPass>>('/boarding-passes', payload),

  getById: (id: string) =>
    apiClient.get<ApiSuccess<BoardingPass>>(`/boarding-passes/${id}`),
};
