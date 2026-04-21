import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiSuccess, Promotion, PromotionValidation } from '../models/domain';

const BASE = 'http://https://integracion-sistemas2026.onrender.com/api/v1';

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private http = inject(HttpClient);

  validate(code: string, amount: number) {
    return this.http.post<ApiSuccess<PromotionValidation>>(`${BASE}/promotions/validate`, { code, amount });
  }

  getAll() {
    return this.http.get<ApiSuccess<Promotion[]>>(`${BASE}/promotions`);
  }

  create(body: Partial<Promotion>) {
    return this.http.post<ApiSuccess<Promotion>>(`${BASE}/promotions`, body);
  }

  update(id: string, body: Partial<Promotion>) {
    return this.http.patch<ApiSuccess<Promotion>>(`${BASE}/promotions/${id}`, body);
  }

  remove(id: string) {
    return this.http.delete<ApiSuccess<unknown>>(`${BASE}/promotions/${id}`);
  }
}
