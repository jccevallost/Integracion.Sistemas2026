import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiSuccess, Flight, FlightSearchParams } from '../models/domain';

const BASE = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class FlightsService {
  private http = inject(HttpClient);

  search(params: FlightSearchParams) {
    return this.http.get<ApiSuccess<Flight[]>>(`${BASE}/flights/search`, { params: params as any });
  }

  getAll() {
    return this.http.get<ApiSuccess<Flight[]>>(`${BASE}/flights`);
  }

  getById(id: string) {
    return this.http.get<ApiSuccess<Flight>>(`${BASE}/flights/${id}`);
  }

  create(body: Partial<Flight>) {
    return this.http.post<ApiSuccess<Flight>>(`${BASE}/flights`, body);
  }

  update(id: string, body: Partial<Flight>) {
    return this.http.put<ApiSuccess<Flight>>(`${BASE}/flights/${id}`, body);
  }

  remove(id: string) {
    return this.http.delete<ApiSuccess<unknown>>(`${BASE}/flights/${id}`);
  }
}
