import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiSuccess, Invoice } from '../models/domain';

const BASE = 'https://vuelos-api-gateway-v2.onrender.com/api/v2';

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
