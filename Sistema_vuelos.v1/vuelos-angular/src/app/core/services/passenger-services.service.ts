import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiSuccess, PassengerService } from '../models/domain';

const BASE = 'http://localhost:3000/api/v1';

export interface CreatePassengerServicePayload {
  passengerId: string; serviceConfigId: string;
  quantity: number; unitPriceAtBooking: number;
}

@Injectable({ providedIn: 'root' })
export class PassengerServicesService {
  private http = inject(HttpClient);

  byPassenger(passengerId: string) {
    return this.http.get<ApiSuccess<PassengerService[]>>(`${BASE}/passenger-services/by-passenger/${passengerId}`);
  }

  create(payload: CreatePassengerServicePayload) {
    return this.http.post<ApiSuccess<PassengerService>>(`${BASE}/passenger-services`, payload);
  }

  remove(id: string) {
    return this.http.delete<ApiSuccess<unknown>>(`${BASE}/passenger-services/${id}`);
  }
}
