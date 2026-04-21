// src/pages/admin/AdminPaymentsPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFormModal, FormField, TextInput, SelectInput } from '@/components/admin/AdminFormModal';
import {
  useAdminPayments, useCreatePayment, useUpdatePayment, useDeletePayment,
  useAdminReservations,
} from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  provider: string;
  transactionId: string;
  status: string;
  createdAt: string;
  reservation?: { reservationCode: string; totalAmount: number };
}

const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
const PROVIDERS = ['STRIPE', 'PAYPAL', 'TRANSFERENCIA', 'EFECTIVO', 'OTRO'];

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  FAILED:    'bg-red-100 text-red-700',
  REFUNDED:  'bg-gray-100 text-gray-600',
};

const emptyRow = () => ({
  reservationId: '',
  amount: '',
  provider: 'STRIPE',
  transactionId: '',
  status: 'PENDING',
});

export function AdminPaymentsPage() {
  const { data, isLoading }         = useAdminPayments();
  const { data: reservations = [] } = useAdminReservations();
  const create = useCreatePayment();
  const update = useUpdatePayment();
  const del    = useDeletePayment();

  type Row = ReturnType<typeof emptyRow> & { id?: string };
  const [modal, setModal] = useState<{ open: boolean; row: Row }>({ open: false, row: emptyRow() });

  function openCreate() { setModal({ open: true, row: emptyRow() }); }
  function openEdit(r: Payment) {
    setModal({
      open: true,
      row: {
        id: r.id,
        reservationId: r.reservationId,
        amount: String(r.amount),
        provider: r.provider,
        transactionId: r.transactionId,
        status: r.status,
      },
    });
  }
  function close() { setModal({ open: false, row: emptyRow() }); }
  function set(p: Partial<Row>) { setModal((m) => ({ ...m, row: { ...m.row, ...p } })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, amount, ...rest } = modal.row;
    const payload = { ...rest, amount: Number(amount) };
    try {
      if (id) await update.mutateAsync({ id, ...payload });
      else     await create.mutateAsync(payload);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    {
      key: 'reservation', label: 'Reserva',
      render: (r: Payment) =>
        r.reservation ? <span className="font-mono text-xs font-bold">#{r.reservation.reservationCode}</span> : '—',
    },
    { key: 'amount', label: 'Monto', render: (r: Payment) => <span className="font-semibold">${Number(r.amount).toFixed(2)}</span> },
    { key: 'provider', label: 'Proveedor', render: (r: Payment) => r.provider },
    { key: 'transactionId', label: 'Transacción', render: (r: Payment) => <span className="font-mono text-xs">{r.transactionId}</span> },
    {
      key: 'status', label: 'Estado',
      render: (r: Payment) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Fecha',
      render: (r: Payment) => {
        try { return format(new Date(r.createdAt), 'd MMM yyyy', { locale: es }); }
        catch { return '—'; }
      },
    },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Pagos"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['transactionId', 'status']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar Pago' : 'Nuevo Pago'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="Reserva" required>
          <SelectInput value={modal.row.reservationId} onChange={(e) => set({ reservationId: e.target.value })} required>
            <option value="">Seleccionar reserva</option>
            {(reservations as any[]).map((r: any) => (
              <option key={r.id} value={r.id}>#{r.reservationCode} — ${Number(r.totalAmount).toFixed(2)}</option>
            ))}
          </SelectInput>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Monto ($)" required>
            <TextInput type="number" min={0} step={0.01} value={modal.row.amount} onChange={(e) => set({ amount: e.target.value })} placeholder="0.00" required />
          </FormField>
          <FormField label="Proveedor" required>
            <SelectInput value={modal.row.provider} onChange={(e) => set({ provider: e.target.value })}>
              {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
            </SelectInput>
          </FormField>
        </div>

        <FormField label="ID de Transacción" required>
          <TextInput value={modal.row.transactionId} onChange={(e) => set({ transactionId: e.target.value })} placeholder="TXN-001" required />
        </FormField>

        <FormField label="Estado" required>
          <SelectInput value={modal.row.status} onChange={(e) => set({ status: e.target.value })}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectInput>
        </FormField>
      </AdminFormModal>
    </>
  );
}
