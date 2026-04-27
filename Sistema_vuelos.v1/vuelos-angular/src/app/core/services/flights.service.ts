import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { ApiSuccess, Flight, FlightSearchParams } from '../models/domain';

const BASE = 'https://integracion-sistemas2026.onrender.com/api/v1';

@Injectable({ providedIn: 'root' })
export class FlightsService {
  private http = inject(HttpClient);

  search(params: FlightSearchParams) {
    let httpParams = new HttpParams()
      .set('origin', params.origin)
      .set('destination', params.destination)
      .set('date', params.date)
      .set('passengers', String(params.passengers));

    if (params.class) httpParams = httpParams.set('class', params.class);

    return this.http.get<ApiSuccess<Flight[]>>(`${BASE}/flights/search`, { params: httpParams });
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
