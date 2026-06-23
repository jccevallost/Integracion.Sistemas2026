import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiSuccess, Invoice } from '../models/domain';

const BASE = 'https://integracion-sistemas2026.onrender.com/api/v1';

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private http = inject(HttpClient);

  byPayment(paymentId: string) {
    return this.http.get<ApiSuccess<Invoice>>(`${BASE}/invoices/by-payment/${paymentId}`);
  }

  byBillingProfile(billingProfileId: string) {
    return this.http.get<ApiSuccess<Invoice[]>>(`${BASE}/invoices/by-billing-profile/${billingProfileId}`);
  }

  getById(id: string) {
    return this.http.get<ApiSuccess<Invoice>>(`${BASE}/invoices/${id}`);
  }
}
