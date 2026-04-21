import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiSuccess, AirlineServiceConfig } from '../models/domain';

const BASE = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class AirlineServiceConfigsService {
  private http = inject(HttpClient);

  byAirline(airlineId: string) {
    return this.http.get<ApiSuccess<AirlineServiceConfig[]>>(`${BASE}/airline-service-configs/by-airline/${airlineId}`);
  }

  list() {
    return this.http.get<ApiSuccess<AirlineServiceConfig[]>>(`${BASE}/airline-service-configs`);
  }
}
