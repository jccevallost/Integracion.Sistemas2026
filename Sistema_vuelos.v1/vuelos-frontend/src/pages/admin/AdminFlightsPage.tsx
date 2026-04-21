// src/pages/admin/AdminFlightsPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import {
  AdminFormModal, FormField, TextInput, SelectInput,
} from '@/components/admin/AdminFormModal';
import {
  useAdminFlights, useCreateFlight, useUpdateFlight, useDeleteFlight,
  useAdminAirlines, useAdminAirports, useCreateSegment,
} from '@/hooks/useAdmin';

interface Flight {
  id: string;
  originAirportIata: string;
  destinationAirportIata: string;
  departureDate: string;
  status: string;
  segments: Array<{ airline?: { name: string; iataCode: string } }>;
  flightClasses: Array<{ cabinClass: string; availableSeats: number; basePrice: number }>;
}

const STATUS_OPTIONS = ['SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED'];

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-green-100 text-green-800',
  DELAYED:   'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
};

const emptyRow = () => ({
  originAirportIata: '',
  destinationAirportIata: '',
  departureDate: '',
  status: 'SCHEDULED',
  // Extra campos para creación de segmento inicial
  airlineId: '',
  originAirportId: '',
  destinationAirportId: '',
  departureDateTime: '',
  arrivalDateTime: '',
  estimatedDuration: '',
});

export function AdminFlightsPage() {
  const { data, isLoading } = useAdminFlights();
  const { data: airlines = [] }  = useAdminAirlines();
  const { data: airports = [] }  = useAdminAirports();
  const create        = useCreateFlight();
  const update        = useUpdateFlight();
  const del           = useDeleteFlight();
  const createSegment = useCreateSegment();

  type Row = ReturnType<typeof emptyRow> & { id?: string };

  const [modal, setModal] = useState<{ open: boolean; row: Row }>({
    open: false,
    row: emptyRow(),
  });

  function openCreate() { setModal({ open: true, row: emptyRow() }); }

  function openEdit(row: Flight) {
    setModal({
      open: true,
      row: {
        ...emptyRow(),
        id: row.id,
        originAirportIata: row.originAirportIata,
        destinationAirportIata: row.destinationAirportIata,
        departureDate: row.departureDate?.split('T')[0] ?? '',
        status: row.status,
      },
    });
  }

  function close() { setModal({ open: false, row: emptyRow() }); }

  function set(partial: Partial<Row>) {
    setModal((m) => ({ ...m, row: { ...m.row, ...partial } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, airlineId, originAirportId, destinationAirportId,
            departureDateTime, arrivalDateTime, estimatedDuration, ...flightBody } = modal.row;
    try {
      if (id) {
        // Sólo actualiza campos del vuelo (aerolínea se gestiona desde Segmentos)
        await update.mutateAsync({ id, ...flightBody });
      } else {
        // Crear vuelo
        const res = await create.mutateAsync(flightBody);
        const flightId = res?.data?.id ?? res?.id;
        // Si se especificó aerolínea y horarios, crear segmento inicial
        if (flightId && airlineId && departureDateTime && arrivalDateTime) {
          const segBody: Record<string, unknown> = {
            flightId,
            segmentNumber: `${flightBody.originAirportIata}-${flightBody.destinationAirportIata}-1`,
            originAirportId:      originAirportId || null,
            destinationAirportId: destinationAirportId || null,
            airlineId,
            departureDateTime: new Date(departureDateTime).toISOString(),
            arrivalDateTime:   new Date(arrivalDateTime).toISOString(),
            estimatedDuration: estimatedDuration ? Number(estimatedDuration) : 0,
          };
          await createSegment.mutateAsync(segBody);
        }
      }
      close();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const columns = [
    {
      key: 'route',
      label: 'Ruta',
      render: (r: Flight) => (
        <span className="font-mono font-semibold">
          {r.originAirportIata} → {r.destinationAirportIata}
        </span>
      ),
    },
    {
      key: 'airline',
      label: 'Aerolínea',
      render: (r: Flight) =>
        r.segments?.length > 0 && r.segments[0].airline
          ? `${r.segments[0].airline.name} (${r.segments[0].airline.iataCode})`
          : '—',
    },
    {
      key: 'departureDate',
      label: 'Fecha',
      render: (r: Flight) =>
        new Date(r.departureDate).toLocaleDateString('es-ES', {
          year: 'numeric', month: 'short', day: 'numeric',
        }),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (r: Flight) => (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'seats',
      label: 'Asientos',
      render: (r: Flight) =>
        r.flightClasses?.reduce((s, fc) => s + fc.availableSeats, 0) ?? 0,
    },
    {
      key: 'price',
      label: 'Precio desde',
      render: (r: Flight) =>
        r.flightClasses?.length > 0
          ? `$${Math.min(...r.flightClasses.map((fc) => Number(fc.basePrice))).toFixed(2)}`
          : '—',
    },
  ];

  const isSaving = create.isPending || update.isPending || createSegment.isPending;
  const isEditing = !!modal.row.id;

  return (
    <>
      <AdminTable
        title="Vuelos"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['originAirportIata', 'destinationAirportIata', 'status']}
      />

      <AdminFormModal
        title={isEditing ? 'Editar Vuelo' : 'Nuevo Vuelo'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Aeropuerto Origen (IATA)" required>
            <TextInput
              value={modal.row.originAirportIata}
              onChange={(e) => set({ originAirportIata: e.target.value.toUpperCase() })}
              maxLength={3}
              placeholder="UIO"
              required
            />
          </FormField>
          <FormField label="Aeropuerto Destino (IATA)" required>
            <TextInput
              value={modal.row.destinationAirportIata}
              onChange={(e) => set({ destinationAirportIata: e.target.value.toUpperCase() })}
              maxLength={3}
              placeholder="BOG"
              required
            />
          </FormField>
        </div>

        <FormField label="Fecha de Salida" required>
          <TextInput
            type="date"
            value={modal.row.departureDate}
            onChange={(e) => set({ departureDate: e.target.value })}
            required
          />
        </FormField>

        <FormField label="Estado" required>
          <SelectInput
            value={modal.row.status}
            onChange={(e) => set({ status: e.target.value })}
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectInput>
        </FormField>

        {/* Sección de segmento inicial — solo al crear */}
        {!isEditing && (
          <>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-t pt-3">
              Segmento inicial (opcional)
            </p>

            <FormField label="Aerolínea">
              <SelectInput
                value={modal.row.airlineId}
                onChange={(e) => set({ airlineId: e.target.value })}
              >
                <option value="">— Sin segmento —</option>
                {(airlines as any[]).map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.iataCode})</option>
                ))}
              </SelectInput>
            </FormField>

            {modal.row.airlineId && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Aeropuerto Origen">
                    <SelectInput
                      value={modal.row.originAirportId}
                      onChange={(e) => set({ originAirportId: e.target.value })}
                    >
                      <option value="">Seleccionar</option>
                      {(airports as any[]).map((a: any) => (
                        <option key={a.id} value={a.id}>{a.iataCode} — {a.name}</option>
                      ))}
                    </SelectInput>
                  </FormField>
                  <FormField label="Aeropuerto Destino">
                    <SelectInput
                      value={modal.row.destinationAirportId}
                      onChange={(e) => set({ destinationAirportId: e.target.value })}
                    >
                      <option value="">Seleccionar</option>
                      {(airports as any[]).map((a: any) => (
                        <option key={a.id} value={a.id}>{a.iataCode} — {a.name}</option>
                      ))}
                    </SelectInput>
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Salida (fecha/hora)">
                    <TextInput
                      type="datetime-local"
                      value={modal.row.departureDateTime}
                      onChange={(e) => set({ departureDateTime: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Llegada (fecha/hora)">
                    <TextInput
                      type="datetime-local"
                      value={modal.row.arrivalDateTime}
                      onChange={(e) => set({ arrivalDateTime: e.target.value })}
                    />
                  </FormField>
                </div>
                <FormField label="Duración estimada (minutos)">
                  <TextInput
                    type="number"
                    min={1}
                    value={modal.row.estimatedDuration}
                    onChange={(e) => set({ estimatedDuration: e.target.value })}
                    placeholder="120"
                  />
                </FormField>
              </>
            )}
          </>
        )}

        {isEditing && (
          <p className="text-xs text-gray-400 border-t pt-3">
            Para cambiar la aerolínea o los segmentos del vuelo, usa la sección <strong>Segmentos</strong>.
          </p>
        )}
      </AdminFormModal>
    </>
  );
}
