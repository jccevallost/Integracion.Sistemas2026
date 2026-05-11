import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiSuccess, Reservation } from '../models/domain';

const BASE = 'https://integracion-sistemas2026.onrender.com/api/v1';

export interface CreateReservationPayload {
  flightClassId: string;
  passengers: { firstName: string; lastName: string; documentNumber: string; seatNumber?: string }[];
  promotionCode?: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private http = inject(HttpClient);

  create(payload: CreateReservationPayload) {
    return this.http.post<ApiSuccess<Reservation>>(`${BASE}/reservations`, payload);
  }

  myReservations() {
    return this.http.get<ApiSuccess<Reservation[]>>(`${BASE}/reservations/my`);
  }

  getById(id: string) {
    return this.http.get<ApiSuccess<Reservation>>(`${BASE}/reservations/${id}`);
  }

  cancel(id: string) {
    return this.http.patch<ApiSuccess<Reservation>>(`${BASE}/reservations/${id}/cancel`, {});
  }

  setSeat(reservationId: string, passengerId: string, seatNumber: string) {
    return this.http.patch<ApiSuccess<any>>(
      `${BASE}/reservations/${reservationId}/passengers/${passengerId}/seat`,
      { seatNumber },
    );
  }

  occupiedSeats(flightClassId: string) {
    return this.http.get<ApiSuccess<string[]>>(`${BASE}/reservations/flight-classes/${flightClassId}/occupied-seats`);
  }

  listAll() {
    return this.http.get<ApiSuccess<Reservation[]>>(`${BASE}/reservations`);
  }
}
