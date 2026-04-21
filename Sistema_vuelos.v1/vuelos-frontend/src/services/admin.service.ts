// src/services/admin.service.ts
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, Airport, Airline, User } from '@/types/domain';

export const adminService = {
  // Dashboard
  dashboard: () =>
    apiClient.get<ApiSuccess<object>>('/admin/dashboard'),

  // Aeropuertos
  airports: {
    getAll:  ()                         => apiClient.get<ApiSuccess<Airport[]>>('/admin/airports'),
    getById: (id: string)               => apiClient.get<ApiSuccess<Airport>>(`/admin/airports/${id}`),
    create:  (data: object)             => apiClient.post<ApiSuccess<Airport>>('/admin/airports', data),
    update:  (id: string, data: object) => apiClient.put<ApiSuccess<Airport>>(`/admin/airports/${id}`, data),
    remove:  (id: string)               => apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/admin/airports/${id}`),
  },

  // Aerolíneas
  airlines: {
    getAll:  ()                         => apiClient.get<ApiSuccess<Airline[]>>('/admin/airlines'),
    getById: (id: string)               => apiClient.get<ApiSuccess<Airline>>(`/admin/airlines/${id}`),
    create:  (data: object)             => apiClient.post<ApiSuccess<Airline>>('/admin/airlines', data),
    update:  (id: string, data: object) => apiClient.put<ApiSuccess<Airline>>(`/admin/airlines/${id}`, data),
    remove:  (id: string)               => apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/admin/airlines/${id}`),
  },

  // Usuarios
  users: {
    getAll:     ()                         => apiClient.get<ApiSuccess<User[]>>('/admin/users'),
    update:     (id: string, data: object) => apiClient.put<ApiSuccess<User>>(`/admin/users/${id}`, data),
    deactivate: (id: string)               => apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/admin/users/${id}`),
  },

  // Vuelos
  flights: {
    getAll:  ()                         => apiClient.get<ApiSuccess<object[]>>('/flights'),
    create:  (data: object)             => apiClient.post<ApiSuccess<object>>('/flights', data),
    update:  (id: string, data: object) => apiClient.put<ApiSuccess<object>>(`/flights/${id}`, data),
    remove:  (id: string)               => apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/flights/${id}`),
  },

  // Países
  countries: {
    getAll:  ()                         => apiClient.get<ApiSuccess<object[]>>('/admin/countries'),
    create:  (data: object)             => apiClient.post<ApiSuccess<object>>('/admin/countries', data),
    update:  (id: string, data: object) => apiClient.put<ApiSuccess<object>>(`/admin/countries/${id}`, data),
    remove:  (id: string)               => apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/admin/countries/${id}`),
  },

  // Ciudades
  cities: {
    getAll:  ()                         => apiClient.get<ApiSuccess<object[]>>('/admin/cities'),
    create:  (data: object)             => apiClient.post<ApiSuccess<object>>('/admin/cities', data),
    update:  (id: string, data: object) => apiClient.put<ApiSuccess<object>>(`/admin/cities/${id}`, data),
    remove:  (id: string)               => apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/admin/cities/${id}`),
  },

  // Aeronaves
  aircraft: {
    getAll:  ()                         => apiClient.get<ApiSuccess<object[]>>('/admin/aircraft'),
    create:  (data: object)             => apiClient.post<ApiSuccess<object>>('/admin/aircraft', data),
    update:  (id: string, data: object) => apiClient.put<ApiSuccess<object>>(`/admin/aircraft/${id}`, data),
    remove:  (id: string)               => apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/admin/aircraft/${id}`),
  },

  // Promociones
  promotions: {
    getAll:  ()                         => apiClient.get<ApiSuccess<object[]>>('/promotions'),
    create:  (data: object)             => apiClient.post<ApiSuccess<object>>('/promotions', data),
    update:  (id: string, data: object) => apiClient.patch<ApiSuccess<object>>(`/promotions/${id}`, data),
    remove:  (id: string)               => apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/promotions/${id}`),
  },

  // Reservas (admin)
  reservations: {
    getAll: () => apiClient.get<ApiSuccess<object[]>>('/reservations'),
  },
};
