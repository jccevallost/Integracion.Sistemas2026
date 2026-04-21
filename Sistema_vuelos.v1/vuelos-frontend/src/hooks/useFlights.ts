// src/hooks/useFlights.ts
// ============================================================
//   Hooks de React Query para vuelos.
//   Separan estado-servidor del estado-cliente.
//   Reto 3: estos hooks funcionan igual en React Native.
// ============================================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flightsService } from '@/services/flights.service';
import type { FlightSearchParams } from '@/types/domain';

// Keys centralizadas — evitan typos y facilitan invalidación
export const flightKeys = {
  all: ['flights'] as const,
  search: (params: FlightSearchParams) => ['flights', 'search', params] as const,
  detail: (id: string) => ['flights', id] as const,
};

export function useFlightSearch(params: FlightSearchParams, enabled = true) {
  return useQuery({
    queryKey: flightKeys.search(params),
    queryFn: () => flightsService.search(params),
    enabled: enabled && !!params.origin && !!params.destination && !!params.date,
    staleTime: 1000 * 60 * 2, // 2 min — vuelos cambian con cierta frecuencia
    select: (res) => res.data,
  });
}

export function useFlights() {
  return useQuery({
    queryKey: flightKeys.all,
    queryFn: flightsService.getAll,
    select: (res) => res.data,
  });
}

export function useFlight(id: string) {
  return useQuery({
    queryKey: flightKeys.detail(id),
    queryFn: () => flightsService.getById(id),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useCreateFlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: flightsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: flightKeys.all }),
  });
}

export function useUpdateFlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => flightsService.update(id, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: flightKeys.all });
      qc.invalidateQueries({ queryKey: flightKeys.detail(id) });
    },
  });
}

export function useDeleteFlight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: flightsService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: flightKeys.all }),
  });
}
