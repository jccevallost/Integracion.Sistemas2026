// src/hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3000/api/v1';

function getToken() {
  return localStorage.getItem('vuelos_token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

function extractData(response: any) {
  if (response?.data?.data) return response.data.data;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

// Todas las queries admin se consideran siempre stale → refetch al montar la página
const ADMIN_QUERY_CONFIG = { staleTime: 0, refetchOnMount: true } as const;

// ── Generic fetch helpers ────────────────────────────────────────
async function adminGet(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`Error al cargar ${path}`);
  const json = await res.json();
  return extractData(json);
}

async function adminPost(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Error al crear');
  }
  return res.json();
}

async function adminPatch(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Error al actualizar');
  }
  return res.json();
}

async function adminDelete(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Error al eliminar');
  return res.json();
}

// ============================================================
// COUNTRIES
// ============================================================
export function useAdminCountries() {
  return useQuery({
    queryKey: ['admin-countries'],
    queryFn: () => adminGet('/admin/countries'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/countries', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-countries'] }),
  });
}

export function useUpdateCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/countries/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-countries'] }),
  });
}

export function useDeleteCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/countries/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-countries'] }),
  });
}

// ============================================================
// CITIES
// ============================================================
export function useAdminCities() {
  return useQuery({
    queryKey: ['admin-cities'],
    queryFn: () => adminGet('/admin/cities'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/cities', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cities'] }),
  });
}

export function useUpdateCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/cities/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cities'] }),
  });
}

export function useDeleteCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/cities/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cities'] }),
  });
}

// ============================================================
// AIRPORTS
// ============================================================
export function useAdminAirports() {
  return useQuery({
    queryKey: ['admin-airports'],
    queryFn: () => adminGet('/admin/airports'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateAirport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/airports', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-airports'] }),
  });
}

export function useUpdateAirport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/airports/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-airports'] }),
  });
}

export function useDeleteAirport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/airports/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-airports'] }),
  });
}

// ============================================================
// AIRLINES
// ============================================================
export function useAdminAirlines() {
  return useQuery({
    queryKey: ['admin-airlines'],
    queryFn: () => adminGet('/admin/airlines'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateAirline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/airlines', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-airlines'] }),
  });
}

export function useUpdateAirline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/airlines/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-airlines'] }),
  });
}

export function useDeleteAirline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/airlines/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-airlines'] }),
  });
}

// ============================================================
// AIRCRAFT
// ============================================================
export function useAdminAircraft() {
  return useQuery({
    queryKey: ['admin-aircraft'],
    queryFn: () => adminGet('/admin/aircraft'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateAircraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/aircraft', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-aircraft'] }),
  });
}

export function useUpdateAircraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/aircraft/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-aircraft'] }),
  });
}

export function useDeleteAircraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/aircraft/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-aircraft'] }),
  });
}

// ============================================================
// FLIGHTS
// ============================================================
export function useAdminFlights() {
  return useQuery({
    queryKey: ['admin-flights'],
    queryFn: () => adminGet('/flights'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateFlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/flights', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-flights'] }),
  });
}

export function useUpdateFlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) => {
      const res = fetch(`${API_URL}/flights/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err?.error?.message || 'Error al actualizar');
        }
        return r.json();
      });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-flights'] }),
  });
}

export function useDeleteFlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/flights/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-flights'] }),
  });
}

// ============================================================
// USERS
// ============================================================
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminGet('/admin/users'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/users/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

// ============================================================
// RESERVATIONS (admin — full CRUD via /admin/reservations)
// ============================================================
export function useAdminReservations() {
  return useQuery({
    queryKey: ['admin-reservations'],
    queryFn: () => adminGet('/admin/reservations'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateAdminReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/reservations', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reservations'] }),
  });
}

export function useUpdateAdminReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/reservations/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reservations'] }),
  });
}

export function useDeleteAdminReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/reservations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reservations'] }),
  });
}

// ============================================================
// CREATE USER (admin)
// ============================================================
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/users', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

// ============================================================
// SEGMENTS
// ============================================================
export function useAdminSegments() {
  return useQuery({
    queryKey: ['admin-segments'],
    queryFn: () => adminGet('/admin/segments'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/segments', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-segments'] }),
  });
}

export function useUpdateSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/segments/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-segments'] }),
  });
}

export function useDeleteSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/segments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-segments'] }),
  });
}

// ============================================================
// FLIGHT CLASSES (clases de vuelo)
// ============================================================
export function useAdminFlightClasses() {
  return useQuery({
    queryKey: ['admin-flightclasses'],
    queryFn: () => adminGet('/admin/flightclasses'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateFlightClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/flightclasses', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-flightclasses'] }),
  });
}

export function useUpdateFlightClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/flightclasses/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-flightclasses'] }),
  });
}

export function useDeleteFlightClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/flightclasses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-flightclasses'] }),
  });
}

// ============================================================
// PAYMENTS (pagos)
// ============================================================
export function useAdminPayments() {
  return useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminGet('/admin/payments'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/payments', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-payments'] }),
  });
}

export function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/payments/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-payments'] }),
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/payments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-payments'] }),
  });
}

// ============================================================
// INVOICES (facturas)
// ============================================================
export function useAdminInvoices() {
  return useQuery({
    queryKey: ['admin-invoices'],
    queryFn: () => adminGet('/admin/invoices'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/invoices', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-invoices'] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/invoices/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-invoices'] }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/invoices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-invoices'] }),
  });
}

// ============================================================
// BOARDING PASSES
// ============================================================
export function useAdminBoardingPasses() {
  return useQuery({
    queryKey: ['admin-boarding-passes'],
    queryFn: () => adminGet('/admin/boarding-passes'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateBoardingPass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/boarding-passes', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-boarding-passes'] }),
  });
}

export function useUpdateBoardingPass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/boarding-passes/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-boarding-passes'] }),
  });
}

export function useDeleteBoardingPass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/boarding-passes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-boarding-passes'] }),
  });
}

// ============================================================
// AUDIT LOGS (solo lectura)
// ============================================================
export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminGet('/admin/auditlogs'),
    ...ADMIN_QUERY_CONFIG,
  });
}

// ============================================================
// SERVICE CATALOG (servicios)
// ============================================================
export function useAdminServices() {
  return useQuery({
    queryKey: ['admin-services'],
    queryFn: () => adminGet('/admin/servicecatalog'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/servicecatalog', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/servicecatalog/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/servicecatalog/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
  });
}

// ============================================================
// PROMOTIONS
// ============================================================
export function useAdminPromotions() {
  return useQuery({
    queryKey: ['admin-promotions'],
    queryFn: () => adminGet('/admin/promotions'),
    ...ADMIN_QUERY_CONFIG,
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => adminPost('/admin/promotions', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promotions'] }),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      adminPatch(`/admin/promotions/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promotions'] }),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDelete(`/admin/promotions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promotions'] }),
  });
}
