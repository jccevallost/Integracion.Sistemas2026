// src/lib/api-client.ts
// ============================================================
//   Cliente HTTP centralizado.
//
//   DISEÑO PARA 3 RETOS:
//   - Reto 1: BASE_URL apunta al monolito en :3800
//   - Reto 2: BASE_URL apunta al API Gateway (mismo contrato)
//   - Reto 3: React Native usa el mismo archivo con fetch nativo
//
//   El componente React nunca conoce la URL — solo llama al
//   servicio, que llama a este cliente.
// ============================================================

import axios, { AxiosInstance, AxiosError } from 'axios';

// En Reto 2, esta variable apunta al API Gateway sin tocar nada más
const BASE_URL = "http://localhost:3000/api/v1";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10_000,
    });

    // Interceptor de request — adjunta token JWT si existe
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('vuelos_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;

      // Correlation ID — trazabilidad end-to-end (teoría sección 1.5)
      config.headers['X-Correlation-Id'] =
        crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

      return config;
    });

    // Interceptor de response — manejo centralizado de errores
    this.client.interceptors.response.use(
      (res) => res,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado → limpiar sesión
          localStorage.removeItem('vuelos_token');
          localStorage.removeItem('vuelos_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: object): Promise<T> {
    const res = await this.client.get<T>(url, { params });
    return res.data;
  }

  async post<T>(url: string, body?: object): Promise<T> {
    const res = await this.client.post<T>(url, body);
    return res.data;
  }

  async put<T>(url: string, body?: object): Promise<T> {
    const res = await this.client.put<T>(url, body);
    return res.data;
  }

  async patch<T>(url: string, body?: object): Promise<T> {
    const res = await this.client.patch<T>(url, body);
    return res.data;
  }

  async delete<T>(url: string): Promise<T> {
    const res = await this.client.delete<T>(url);
    return res.data;
  }
}

// Singleton — un solo cliente en toda la app
export const apiClient = new ApiClient();
