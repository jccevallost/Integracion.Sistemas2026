import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiSuccess, BoardingPass } from '../models/domain';

const BASE = 'https://integracion-sistemas2026.onrender.com/api/v1';

export interface CreateBoardingPassPayload {
  passengerId: string; segmentId: string; boardingCode: string;
  gate?: string | null; boardingGroup?: string | null;
  checkInAt?: string | null; status?: string;
}

@Injectable({ providedIn: 'root' })
export class BoardingPassesService {
  private http = inject(HttpClient);

  byPassenger(passengerId: string) {
    return this.http.get<ApiSuccess<BoardingPass[]>>(`${BASE}/boarding-passes/by-passenger/${passengerId}`);
  }

  create(payload: CreateBoardingPassPayload) {
    return this.http.post<ApiSuccess<BoardingPass>>(`${BASE}/boarding-passes`, payload);
  }

  getById(id: string) {
    return this.http.get<ApiSuccess<BoardingPass>>(`${BASE}/boarding-passes/${id}`);
  }
}
