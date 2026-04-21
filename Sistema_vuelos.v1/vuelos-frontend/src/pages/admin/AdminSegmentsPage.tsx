// src/pages/admin/AdminSegmentsPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFormModal, FormField, TextInput, SelectInput } from '@/components/admin/AdminFormModal';
import {
  useAdminSegments, useCreateSegment, useUpdateSegment, useDeleteSegment,
  useAdminFlights, useAdminAirlines, useAdminAirports, useAdminAircraft,
} from '@/hooks/useAdmin';

interface Segment {
  id: string;
  segmentNumber: string;
  flightId?: string | null;
  estimatedDuration: number;
  departureDateTime: string;
  arrivalDateTime: string;
  originAirport?: { iataCode: string; name: string };
  destinationAirport?: { iataCode: string; name: string };
  airline?: { name: string; iataCode: string };
  aircraft?: { modelName: string; registration: string } | null;
}

const emptyRow = () => ({
  segmentNumber: '',
  flightId: '',
  originAirportId: '',
  destinationAirportId: '',
  airlineId: '',
  aircraftId: '',
  departureDateTime: '',
  arrivalDateTime: '',
  estimatedDuration: '',
});

export function AdminSegmentsPage() {
  const { data, isLoading }      = useAdminSegments();
  const { data: flights = [] }   = useAdminFlights();
  const { data: airlines = [] }  = useAdminAirlines();
  const { data: airports = [] }  = useAdminAirports();
  const { data: aircraft = [] }  = useAdminAircraft();
  const create = useCreateSegment();
  const update = useUpdateSegment();
  const del    = useDeleteSegment();

  type Row = ReturnType<typeof emptyRow> & { id?: string };
  const [modal, setModal] = useState<{ open: boolean; row: Row }>({ open: false, row: emptyRow() });

  function openCreate() { setModal({ open: true, row: emptyRow() }); }
  function openEdit(r: Segment) {
    setModal({
      open: true,
      row: {
        id: r.id,
        segmentNumber: r.segmentNumber,
        flightId: (r as any).flightId ?? '',
        originAirportId: (r as any).originAirportId ?? '',
        destinationAirportId: (r as any).destinationAirportId ?? '',
        airlineId: (r as any).airlineId ?? '',
        aircraftId: (r as any).aircraftId ?? '',
        departureDateTime: r.departureDateTime ? r.departureDateTime.slice(0, 16) : '',
        arrivalDateTime:   r.arrivalDateTime   ? r.arrivalDateTime.slice(0, 16)   : '',
        estimatedDuration: String(r.estimatedDuration ?? ''),
      },
    });
  }
  function close() { setModal({ open: false, row: emptyRow() }); }
  function set(p: Partial<Row>) { setModal((m) => ({ ...m, row: { ...m.row, ...p } })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, estimatedDuration, departureDateTime, arrivalDateTime, ...rest } = modal.row;
    const payload: Record<string, unknown> = {
      ...rest,
      estimatedDuration: estimatedDuration !== '' ? Number(estimatedDuration) : 0,
      departureDateTime: departureDateTime ? new Date(departureDateTime).toISOString() : undefined,
      arrivalDateTime:   arrivalDateTime   ? new Date(arrivalDateTime).toISOString()   : undefined,
      flightId: rest.flightId || null,
      aircraftId: rest.aircraftId || null,
    };
    try {
      if (id) await update.mutateAsync({ id, ...payload });
      else     await create.mutateAsync(payload);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    { key: 'segmentNumber', label: 'N° Segmento', render: (r: Segment) => <span className="font-mono font-semibold">{r.segmentNumber}</span> },
    { key: 'route', label: 'Ruta', render: (r: Segment) =>
        `${r.originAirport?.iataCode ?? '?'} → ${r.destinationAirport?.iataCode ?? '?'}` },
    { key: 'airline', label: 'Aerolínea', render: (r: Segment) => r.airline?.name ?? '—' },
    { key: 'aircraft', label: 'Aeronave', render: (r: Segment) => r.aircraft?.modelName ?? '—' },
    { key: 'departure', label: 'Salida', render: (r: Segment) =>
        r.departureDateTime ? new Date(r.departureDateTime).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '—' },
    { key: 'duration', label: 'Duración', render: (r: Segment) => `${r.estimatedDuration} min` },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Segmentos de Vuelo"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['segmentNumber']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar Segmento' : 'Nuevo Segmento'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="N° de Segmento" required>
          <TextInput value={modal.row.segmentNumber} onChange={(e) => set({ segmentNumber: e.target.value })} placeholder="UIO-BOG-1" required />
        </FormField>

        <FormField label="Vuelo (opcional)">
          <SelectInput value={modal.row.flightId} onChange={(e) => set({ flightId: e.target.value })}>
            <option value="">Sin vuelo asignado</option>
            {(flights as any[]).map((f: any) => (
              <option key={f.id} value={f.id}>{f.originAirportIata} → {f.destinationAirportIata} — {f.departureDate?.split('T')[0]}</option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Aerolínea" required>
          <SelectInput value={modal.row.airlineId} onChange={(e) => set({ airlineId: e.target.value })} required>
            <option value="">Seleccionar aerolínea</option>
            {(airlines as any[]).map((a: any) => (
              <option key={a.id} value={a.id}>{a.name} ({a.iataCode})</option>
            ))}
          </SelectInput>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Aeropuerto Origen" required>
            <SelectInput value={modal.row.originAirportId} onChange={(e) => set({ originAirportId: e.target.value })} required>
              <option value="">Seleccionar</option>
              {(airports as any[]).map((a: any) => (
                <option key={a.id} value={a.id}>{a.iataCode} — {a.name}</option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Aeropuerto Destino" required>
            <SelectInput value={modal.row.destinationAirportId} onChange={(e) => set({ destinationAirportId: e.target.value })} required>
              <option value="">Seleccionar</option>
              {(airports as any[]).map((a: any) => (
                <option key={a.id} value={a.id}>{a.iataCode} — {a.name}</option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <FormField label="Aeronave (opcional)">
          <SelectInput value={modal.row.aircraftId} onChange={(e) => set({ aircraftId: e.target.value })}>
            <option value="">Sin aeronave</option>
            {(aircraft as any[]).map((a: any) => (
              <option key={a.id} value={a.id}>{a.modelName} — {a.registration}</option>
            ))}
          </SelectInput>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Salida" required>
            <TextInput type="datetime-local" value={modal.row.departureDateTime} onChange={(e) => set({ departureDateTime: e.target.value })} required />
          </FormField>
          <FormField label="Llegada" required>
            <TextInput type="datetime-local" value={modal.row.arrivalDateTime} onChange={(e) => set({ arrivalDateTime: e.target.value })} required />
          </FormField>
        </div>

        <FormField label="Duración estimada (min)" required>
          <TextInput type="number" min={1} value={modal.row.estimatedDuration} onChange={(e) => set({ estimatedDuration: e.target.value })} placeholder="120" required />
        </FormField>
      </AdminFormModal>
    </>
  );
}
