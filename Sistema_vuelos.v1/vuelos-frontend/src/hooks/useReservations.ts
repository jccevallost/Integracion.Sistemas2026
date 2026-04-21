// src/hooks/useReservations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsService, type CreateReservationPayload } from '@/services/reservations.service';

export const reservationKeys = {
  all: ['reservations'] as const,
  my: ['reservations', 'my'] as const,
  detail: (id: string) => ['reservations', id] as const,
};

export function useMyReservations() {
  return useQuery({
    queryKey: reservationKeys.my,
    queryFn: reservationsService.myReservations,
    select: (res) => res.data,
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => reservationsService.getById(id),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useAllReservations() {
  return useQuery({
    queryKey: reservationKeys.all,
    queryFn: reservationsService.listAll,
    select: (res) => res.data,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReservationPayload) => reservationsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.my });
      qc.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reservationsService.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.my });
      qc.invalidateQueries({ queryKey: reservationKeys.all });
    },
  });
}
