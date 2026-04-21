// src/pages/admin/AdminBoardingPassesPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFormModal, FormField, TextInput, SelectInput } from '@/components/admin/AdminFormModal';
import {
  useAdminBoardingPasses, useCreateBoardingPass, useUpdateBoardingPass, useDeleteBoardingPass,
  useAdminSegments,
} from '@/hooks/useAdmin';

interface BoardingPass {
  id: string;
  seatNumber?: string | null;
  boardingGroup?: string | null;
  gateNumber?: string | null;
  boardingTime?: string | null;
  checkInStatus: string;
  passenger?: { firstName: string; lastName: string };
  segment?: {
    segmentNumber: string;
    originAirport?: { iataCode: string };
    destinationAirport?: { iataCode: string };
    airline?: { name: string };
  };
}

const CHECKIN_STATUSES = ['NOT_CHECKED_IN', 'CHECKED_IN', 'BOARDED', 'NO_SHOW'];
const CHECKIN_COLORS: Record<string, string> = {
  NOT_CHECKED_IN: 'bg-gray-100 text-gray-600',
  CHECKED_IN:     'bg-blue-100 text-blue-700',
  BOARDED:        'bg-green-100 text-green-700',
  NO_SHOW:        'bg-red-100 text-red-700',
};
const CHECKIN_LABELS: Record<string, string> = {
  NOT_CHECKED_IN: 'Sin Check-in',
  CHECKED_IN:     'Check-in OK',
  BOARDED:        'Abordó',
  NO_SHOW:        'No se presentó',
};

const emptyRow = () => ({
  reservationPassengerId: '',
  segmentId: '',
  seatNumber: '',
  boardingGroup: '',
  gateNumber: '',
  boardingTime: '',
  checkInStatus: 'NOT_CHECKED_IN',
});

export function AdminBoardingPassesPage() {
  const { data, isLoading }     = useAdminBoardingPasses();
  const { data: segments = [] } = useAdminSegments();
  const create = useCreateBoardingPass();
  const update = useUpdateBoardingPass();
  const del    = useDeleteBoardingPass();

  type Row = ReturnType<typeof emptyRow> & { id?: string };
  const [modal, setModal] = useState<{ open: boolean; row: Row }>({ open: false, row: emptyRow() });

  function openCreate() { setModal({ open: true, row: emptyRow() }); }
  function openEdit(r: BoardingPass) {
    setModal({
      open: true,
      row: {
        id: r.id,
        reservationPassengerId: (r as any).reservationPassengerId ?? '',
        segmentId: (r as any).segmentId ?? '',
        seatNumber: r.seatNumber ?? '',
        boardingGroup: r.boardingGroup ?? '',
        gateNumber: r.gateNumber ?? '',
        boardingTime: r.boardingTime ? r.boardingTime.slice(0, 16) : '',
        checkInStatus: r.checkInStatus,
      },
    });
  }
  function close() { setModal({ open: false, row: emptyRow() }); }
  function set(p: Partial<Row>) { setModal((m) => ({ ...m, row: { ...m.row, ...p } })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, boardingTime, seatNumber, boardingGroup, gateNumber, ...rest } = modal.row;
    const payload: Record<string, unknown> = {
      ...rest,
      seatNumber: seatNumber || null,
      boardingGroup: boardingGroup || null,
      gateNumber: gateNumber || null,
      boardingTime: boardingTime ? new Date(boardingTime).toISOString() : null,
    };
    try {
      if (id) await update.mutateAsync({ id, ...payload });
      else     await create.mutateAsync(payload);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    {
      key: 'passenger', label: 'Pasajero',
      render: (r: BoardingPass) =>
        r.passenger ? `${r.passenger.firstName} ${r.passenger.lastName}` : '—',
    },
    {
      key: 'segment', label: 'Segmento',
      render: (r: BoardingPass) =>
        r.segment
          ? `${r.segment.originAirport?.iataCode ?? '?'} → ${r.segment.destinationAirport?.iataCode ?? '?'}`
          : '—',
    },
    { key: 'seatNumber',   label: 'Asiento', render: (r: BoardingPass) => r.seatNumber ?? '—' },
    { key: 'boardingGroup', label: 'Grupo',  render: (r: BoardingPass) => r.boardingGroup ?? '—' },
    { key: 'gateNumber',   label: 'Puerta',  render: (r: BoardingPass) => r.gateNumber ?? '—' },
    {
      key: 'checkInStatus', label: 'Estado',
      render: (r: BoardingPass) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CHECKIN_COLORS[r.checkInStatus] ?? 'bg-gray-100 text-gray-700'}`}>
          {CHECKIN_LABELS[r.checkInStatus] ?? r.checkInStatus}
        </span>
      ),
    },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Tarjetas de Embarque"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['seatNumber', 'checkInStatus']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar Tarjeta de Embarque' : 'Nueva Tarjeta de Embarque'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="ID Pasajero de Reserva" required>
          <TextInput
            value={modal.row.reservationPassengerId}
            onChange={(e) => set({ reservationPassengerId: e.target.value })}
            placeholder="ID del reservation passenger"
            required
          />
        </FormField>

        <FormField label="Segmento" required>
          <SelectInput value={modal.row.segmentId} onChange={(e) => set({ segmentId: e.target.value })} required>
            <option value="">Seleccionar segmento</option>
            {(segments as any[]).map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.segmentNumber} — {s.originAirport?.iataCode ?? '?'} → {s.destinationAirport?.iataCode ?? '?'}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="N° Asiento">
            <TextInput value={modal.row.seatNumber} onChange={(e) => set({ seatNumber: e.target.value })} placeholder="12A" />
          </FormField>
          <FormField label="Grupo">
            <TextInput value={modal.row.boardingGroup} onChange={(e) => set({ boardingGroup: e.target.value })} placeholder="A" />
          </FormField>
          <FormField label="Puerta">
            <TextInput value={modal.row.gateNumber} onChange={(e) => set({ gateNumber: e.target.value })} placeholder="G12" />
          </FormField>
          <FormField label="Hora Embarque">
            <TextInput type="datetime-local" value={modal.row.boardingTime} onChange={(e) => set({ boardingTime: e.target.value })} />
          </FormField>
        </div>

        <FormField label="Estado Check-in" required>
          <SelectInput value={modal.row.checkInStatus} onChange={(e) => set({ checkInStatus: e.target.value })}>
            {CHECKIN_STATUSES.map((s) => <option key={s} value={s}>{CHECKIN_LABELS[s]}</option>)}
          </SelectInput>
        </FormField>
      </AdminFormModal>
    </>
  );
}
