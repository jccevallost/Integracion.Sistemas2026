import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { ApiSuccess, AirlineServiceConfig } from '../models/domain';

const BASE = 'https://integracion-sistemas2026.onrender.com/api/v1';
const PATH = `${BASE}/airline-service-config`;

@Injectable({ providedIn: 'root' })
export class AirlineServiceConfigsService {
  private http = inject(HttpClient);

  byAirline(airlineId: string, originAirportId?: string | null, destAirportId?: string | null) {
    let params = new HttpParams();
    if (originAirportId) params = params.set('originAirportId', originAirportId);
    if (destAirportId) params = params.set('destAirportId', destAirportId);

    return this.http.get<ApiSuccess<AirlineServiceConfig[]>>(`${PATH}/by-airline/${airlineId}`, { params });
  }

  list() {
    return this.http.get<ApiSuccess<AirlineServiceConfig[]>>(PATH);
  }
}
