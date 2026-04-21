import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiSuccess, Payment } from '../models/domain';

const BASE = 'http://https://integracion-sistemas2026.onrender.com/api/v1';

export interface CreatePaymentPayload {
  reservationId: string; amount: number; provider: string; transactionId: string; status?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private http = inject(HttpClient);

  create(payload: CreatePaymentPayload) {
    return this.http.post<ApiSuccess<Payment>>(`${BASE}/payments`, payload);
  }

  byReservation(reservationId: string) {
    return this.http.get<ApiSuccess<Payment[]>>(`${BASE}/payments/by-reservation/${reservationId}`);
  }

  getById(id: string) {
    return this.http.get<ApiSuccess<Payment>>(`${BASE}/payments/${id}`);
  }

  listAll() {
    return this.http.get<ApiSuccess<Payment[]>>(`${BASE}/payments`);
  }
}
