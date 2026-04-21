// src/pages/admin/AdminFlightClassesPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFormModal, FormField, TextInput, SelectInput } from '@/components/admin/AdminFormModal';
import {
  useAdminFlightClasses, useCreateFlightClass, useUpdateFlightClass, useDeleteFlightClass,
  useAdminFlights,
} from '@/hooks/useAdmin';

interface FlightClass {
  id: string;
  flightId: string;
  cabinClass: string;
  availableSeats: number;
  basePrice: number;
  flight?: { originAirportIata: string; destinationAirportIata: string };
}

const CABIN_OPTIONS = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
const CABIN_LABELS: Record<string, string> = {
  ECONOMY: 'Económica', PREMIUM_ECONOMY: 'Premium Economy', BUSINESS: 'Business', FIRST: 'Primera Clase',
};
const CABIN_COLORS: Record<string, string> = {
  ECONOMY: 'bg-gray-100 text-gray-700',
  PREMIUM_ECONOMY: 'bg-blue-100 text-blue-700',
  BUSINESS: 'bg-amber-100 text-amber-700',
  FIRST: 'bg-purple-100 text-purple-700',
};

const emptyRow = () => ({
  flightId: '',
  cabinClass: 'ECONOMY',
  availableSeats: '',
  basePrice: '',
});

export function AdminFlightClassesPage() {
  const { data, isLoading }    = useAdminFlightClasses();
  const { data: flights = [] } = useAdminFlights();
  const create = useCreateFlightClass();
  const update = useUpdateFlightClass();
  const del    = useDeleteFlightClass();

  type Row = ReturnType<typeof emptyRow> & { id?: string };
  const [modal, setModal] = useState<{ open: boolean; row: Row }>({ open: false, row: emptyRow() });

  function openCreate() { setModal({ open: true, row: emptyRow() }); }
  function openEdit(r: FlightClass) {
    setModal({
      open: true,
      row: {
        id: r.id,
        flightId: r.flightId,
        cabinClass: r.cabinClass,
        availableSeats: String(r.availableSeats),
        basePrice: String(r.basePrice),
      },
    });
  }
  function close() { setModal({ open: false, row: emptyRow() }); }
  function set(p: Partial<Row>) { setModal((m) => ({ ...m, row: { ...m.row, ...p } })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, availableSeats, basePrice, ...rest } = modal.row;
    const payload = { ...rest, availableSeats: Number(availableSeats), basePrice: Number(basePrice) };
    try {
      if (id) await update.mutateAsync({ id, ...payload });
      else     await create.mutateAsync(payload);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    {
      key: 'flight', label: 'Vuelo',
      render: (r: FlightClass) =>
        r.flight ? <span className="font-mono font-semibold">{r.flight.originAirportIata} → {r.flight.destinationAirportIata}</span> : '—',
    },
    {
      key: 'cabinClass', label: 'Clase',
      render: (r: FlightClass) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CABIN_COLORS[r.cabinClass] ?? 'bg-gray-100 text-gray-700'}`}>
          {CABIN_LABELS[r.cabinClass] ?? r.cabinClass}
        </span>
      ),
    },
    { key: 'availableSeats', label: 'Asientos Disp.', render: (r: FlightClass) => r.availableSeats },
    { key: 'basePrice', label: 'Precio Base', render: (r: FlightClass) => `$${Number(r.basePrice).toFixed(2)}` },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Clases de Vuelo"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['cabinClass']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar Clase de Vuelo' : 'Nueva Clase de Vuelo'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="Vuelo" required>
          <SelectInput value={modal.row.flightId} onChange={(e) => set({ flightId: e.target.value })} required>
            <option value="">Seleccionar vuelo</option>
            {(flights as any[]).map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.originAirportIata} → {f.destinationAirportIata} — {f.departureDate?.split('T')[0]}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Clase de Cabina" required>
          <SelectInput value={modal.row.cabinClass} onChange={(e) => set({ cabinClass: e.target.value })}>
            {CABIN_OPTIONS.map((c) => <option key={c} value={c}>{CABIN_LABELS[c]}</option>)}
          </SelectInput>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Asientos Disponibles" required>
            <TextInput type="number" min={0} value={modal.row.availableSeats} onChange={(e) => set({ availableSeats: e.target.value })} placeholder="100" required />
          </FormField>
          <FormField label="Precio Base ($)" required>
            <TextInput type="number" min={0} step={0.01} value={modal.row.basePrice} onChange={(e) => set({ basePrice: e.target.value })} placeholder="150.00" required />
          </FormField>
        </div>
      </AdminFormModal>
    </>
  );
}
