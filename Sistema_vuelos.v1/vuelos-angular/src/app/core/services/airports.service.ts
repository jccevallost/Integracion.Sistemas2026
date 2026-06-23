import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { Airport, ApiSuccess } from '../models/domain';

const API_URL =
  (environment as { apiUrl?: string }).apiUrl ?? 'https://integracion-sistemas2026.onrender.com/api/v1';

function extractData<T>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

@Injectable({ providedIn: 'root' })
export class AirportsService {
  private http = inject(HttpClient);

  getAll() {
    return this.http
      .get<ApiSuccess<Airport[]> | Airport[]>(`${API_URL}/airports`)
      .pipe(map(res => extractData<Airport>(res)));
  }

  search(query: string) {
    return this.http
      .get<ApiSuccess<Airport[]> | Airport[]>(`${API_URL}/airports/search`, { params: { q: query } })
      .pipe(map(res => extractData<Airport>(res)));
  }
}
