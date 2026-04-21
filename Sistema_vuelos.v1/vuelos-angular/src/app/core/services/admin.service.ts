import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthStore } from '../store/auth.store';

const API_URL = 'http://https://integracion-sistemas2026.onrender.com/api/v1';

function extractData(res: any): any[] {
  if (res?.data?.data) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return res?.data ?? [];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http  = inject(HttpClient);

  private get<T>(path: string): Observable<T[]> {
    return this.http.get<any>(`${API_URL}${path}`).pipe(map(extractData));
  }

  private post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<any>(`${API_URL}${path}`, body).pipe(map(r => r?.data ?? r));
  }

  private patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<any>(`${API_URL}${path}`, body).pipe(map(r => r?.data ?? r));
  }

  private put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<any>(`${API_URL}${path}`, body).pipe(map(r => r?.data ?? r));
  }

  private del<T>(path: string): Observable<T> {
    return this.http.delete<any>(`${API_URL}${path}`).pipe(map(r => r?.data ?? r));
  }

  // Countries
  getCountries()                       { return this.get('/admin/countries'); }
  createCountry(b: unknown)            { return this.post('/admin/countries', b); }
  updateCountry(id: string, b: unknown){ return this.patch(`/admin/countries/${id}`, b); }
  deleteCountry(id: string)            { return this.del(`/admin/countries/${id}`); }

  // Cities
  getCities()                          { return this.get('/admin/cities'); }
  createCity(b: unknown)               { return this.post('/admin/cities', b); }
  updateCity(id: string, b: unknown)   { return this.patch(`/admin/cities/${id}`, b); }
  deleteCity(id: string)               { return this.del(`/admin/cities/${id}`); }

  // Airports
  getAirports()                        { return this.get('/admin/airports'); }
  createAirport(b: unknown)            { return this.post('/admin/airports', b); }
  updateAirport(id: string, b: unknown){ return this.patch(`/admin/airports/${id}`, b); }
  deleteAirport(id: string)            { return this.del(`/admin/airports/${id}`); }

  // Airlines
  getAirlines()                        { return this.get('/admin/airlines'); }
  createAirline(b: unknown)            { return this.post('/admin/airlines', b); }
  updateAirline(id: string, b: unknown){ return this.patch(`/admin/airlines/${id}`, b); }
  deleteAirline(id: string)            { return this.del(`/admin/airlines/${id}`); }

  // Aircraft
  getAircraft()                        { return this.get('/admin/aircraft'); }
  createAircraft(b: unknown)           { return this.post('/admin/aircraft', b); }
  updateAircraft(id: string, b: unknown){ return this.patch(`/admin/aircraft/${id}`, b); }
  deleteAircraft(id: string)           { return this.del(`/admin/aircraft/${id}`); }

  // Flights
  getFlights()                         { return this.get('/flights'); }
  createFlight(b: unknown)             { return this.post('/flights', b); }
  updateFlight(id: string, b: unknown) { return this.put(`/flights/${id}`, b); }
  deleteFlight(id: string)             { return this.del(`/flights/${id}`); }

  // Segments
  getSegments()                        { return this.get('/admin/segments'); }
  createSegment(b: unknown)            { return this.post('/admin/segments', b); }
  updateSegment(id: string, b: unknown){ return this.patch(`/admin/segments/${id}`, b); }
  deleteSegment(id: string)            { return this.del(`/admin/segments/${id}`); }

  // Flight Classes
  getFlightClasses()                         { return this.get('/admin/flightclasses'); }
  createFlightClass(b: unknown)              { return this.post('/admin/flightclasses', b); }
  updateFlightClass(id: string, b: unknown)  { return this.patch(`/admin/flightclasses/${id}`, b); }
  deleteFlightClass(id: string)              { return this.del(`/admin/flightclasses/${id}`); }

  // Users
  getUsers()                           { return this.get('/admin/users'); }
  createUser(b: unknown)               { return this.post('/admin/users', b); }
  updateUser(id: string, b: unknown)   { return this.patch(`/admin/users/${id}`, b); }
  deleteUser(id: string)               { return this.del(`/admin/users/${id}`); }

  // Reservations (admin)
  getReservations()                          { return this.get('/admin/reservations'); }
  createReservation(b: unknown)              { return this.post('/admin/reservations', b); }
  updateReservation(id: string, b: unknown)  { return this.patch(`/admin/reservations/${id}`, b); }
  deleteReservation(id: string)              { return this.del(`/admin/reservations/${id}`); }

  // Payments
  getPayments()                        { return this.get('/admin/payments'); }
  createPayment(b: unknown)            { return this.post('/admin/payments', b); }
  updatePayment(id: string, b: unknown){ return this.patch(`/admin/payments/${id}`, b); }
  deletePayment(id: string)            { return this.del(`/admin/payments/${id}`); }

  // Invoices
  getInvoices()                        { return this.get('/admin/invoices'); }
  createInvoice(b: unknown)            { return this.post('/admin/invoices', b); }
  updateInvoice(id: string, b: unknown){ return this.patch(`/admin/invoices/${id}`, b); }
  deleteInvoice(id: string)            { return this.del(`/admin/invoices/${id}`); }

  // Boarding Passes
  getBoardingPasses()                            { return this.get('/admin/boarding-passes'); }
  createBoardingPass(b: unknown)                 { return this.post('/admin/boarding-passes', b); }
  updateBoardingPass(id: string, b: unknown)     { return this.patch(`/admin/boarding-passes/${id}`, b); }
  deleteBoardingPass(id: string)                 { return this.del(`/admin/boarding-passes/${id}`); }

  // Audit Logs (read-only)
  getAuditLogs()                       { return this.get('/admin/auditlogs'); }

  // Service Catalog
  getServices()                        { return this.get('/admin/servicecatalog'); }
  createService(b: unknown)            { return this.post('/admin/servicecatalog', b); }
  updateService(id: string, b: unknown){ return this.patch(`/admin/servicecatalog/${id}`, b); }
  deleteService(id: string)            { return this.del(`/admin/servicecatalog/${id}`); }

  // Promotions
  getPromotions()                          { return this.get('/admin/promotions'); }
  createPromotion(b: unknown)              { return this.post('/admin/promotions', b); }
  updatePromotion(id: string, b: unknown)  { return this.patch(`/admin/promotions/${id}`, b); }
  deletePromotion(id: string)              { return this.del(`/admin/promotions/${id}`); }
}
