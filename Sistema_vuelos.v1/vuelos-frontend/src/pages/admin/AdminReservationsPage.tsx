// src/pages/admin/AdminReservationsPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import {
  AdminFormModal, FormField, TextInput, SelectInput,
} from '@/components/admin/AdminFormModal';
import {
  useAdminReservations, useCreateAdminReservation,
  useUpdateAdminReservation, useDeleteAdminReservation,
  useAdminFlights, useAdminUsers,
} from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Reservation {
  id: string;
  reservationCode: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  flightId: string;
  userId: string;
  promotionId?: string | null;
  flight?: { originAirportIata: string; destinationAirportIata: string };
  user?: { firstName: string; firstLastName: string; email: string };
  passengers?: any[];
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED'];

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada',
};

const emptyRow = () => ({
  flightId: '',
  userId: '',
  status: 'PENDING',
  totalAmount: '',
  promotionCode: '',
});

export function AdminReservationsPage() {
  const { data, isLoading }  = useAdminReservations();
  const { data: flights = [] } = useAdminFlights();
  const { data: users = [] }   = useAdminUsers();
  const create = useCreateAdminReservation();
  const update = useUpdateAdminReservation();
  const del    = useDeleteAdminReservation();

  type Row = ReturnType<typeof emptyRow> & { id?: string };
  const [modal, setModal] = useState<{ open: boolean; row: Row }>({
    open: false, row: emptyRow(),
  });

  function openCreate() { setModal({ open: true, row: emptyRow() }); }

  function openEdit(r: Reservation) {
    setModal({
      open: true,
      row: {
        id: r.id,
        flightId: r.flightId,
        userId: r.userId,
        status: r.status,
        totalAmount: String(r.totalAmount),
        promotionCode: '',
      },
    });
  }

  function close() { setModal({ open: false, row: emptyRow() }); }
  function set(p: Partial<Row>) { setModal((m) => ({ ...m, row: { ...m.row, ...p } })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, promotionCode, totalAmount, ...rest } = modal.row;
    const payload: Record<string, unknown> = {
      ...rest,
      totalAmount: totalAmount !== '' ? Number(totalAmount) : undefined,
    };
    if (promotionCode) payload.promotionCode = promotionCode;
    try {
      if (id) await update.mutateAsync({ id, ...payload });
      else     await create.mutateAsync(payload);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    {
      key: 'reservationCode',
      label: 'Código',
      render: (r: Reservation) => (
        <span className="font-mono text-xs font-bold">#{r.reservationCode ?? '—'}</span>
      ),
    },
    {
      key: 'user',
      label: 'Usuario',
      render: (r: Reservation) =>
        r.user ? `${r.user.firstName} ${r.user.firstLastName}` : '—',
    },
    {
      key: 'route',
      label: 'Ruta',
      render: (r: Reservation) =>
        r.flight
          ? `${r.flight.originAirportIata} → ${r.flight.destinationAirportIata}`
          : '—',
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (r: Reservation) => {
        try { return format(new Date(r.createdAt), 'd MMM yyyy', { locale: es }); }
        catch { return '—'; }
      },
    },
    {
      key: 'passengers',
      label: 'Pas.',
      render: (r: Reservation) => r.passengers?.length ?? 0,
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (r: Reservation) => (
        <span className="font-semibold">${Number(r.totalAmount).toFixed(2)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (r: Reservation) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[r.status] ?? r.status}
        </span>
      ),
    },
  ];

  const isSaving = create.isPending || update.isPending;
  const isEditing = !!modal.row.id;

  return (
    <>
      <AdminTable
        title="Reservas"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['reservationCode']}
      />

      <AdminFormModal
        title={isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="Vuelo" required>
          <SelectInput
            value={modal.row.flightId}
            onChange={(e) => set({ flightId: e.target.value })}
            required
          >
            <option value="">Seleccionar vuelo</option>
            {(flights as any[]).map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.originAirportIata} → {f.destinationAirportIata} — {f.departureDate?.split('T')[0] ?? ''}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Usuario" required>
          <SelectInput
            value={modal.row.userId}
            onChange={(e) => set({ userId: e.target.value })}
            required
          >
            <option value="">Seleccionar usuario</option>
            {(users as any[]).map((u: any) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.firstLastName} — {u.email}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Estado" required>
          <SelectInput
            value={modal.row.status}
            onChange={(e) => set({ status: e.target.value })}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Monto Total ($)">
          <TextInput
            type="number"
            min={0}
            step={0.01}
            value={modal.row.totalAmount}
            onChange={(e) => set({ totalAmount: e.target.value })}
            placeholder="0.00"
          />
        </FormField>

        {!isEditing && (
          <FormField label="Código de Promoción (opcional)">
            <TextInput
              value={modal.row.promotionCode}
              onChange={(e) => set({ promotionCode: e.target.value.toUpperCase() })}
              placeholder="PROMO20"
            />
          </FormField>
        )}
      </AdminFormModal>
    </>
  );
}
