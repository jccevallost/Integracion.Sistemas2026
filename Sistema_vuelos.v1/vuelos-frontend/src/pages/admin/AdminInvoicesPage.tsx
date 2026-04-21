// src/pages/admin/AdminInvoicesPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFormModal, FormField, TextInput, SelectInput } from '@/components/admin/AdminFormModal';
import {
  useAdminInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice,
  useAdminPayments,
} from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Invoice {
  id: string;
  invoiceNumber?: string;
  paymentId: string;
  billingProfileId?: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  payment?: { reservation?: { reservationCode: string } };
}

const INVOICE_STATUSES = ['DRAFT', 'ISSUED', 'PAID', 'CANCELLED'];
const STATUS_COLORS: Record<string, string> = {
  PAID:      'bg-green-100 text-green-700',
  ISSUED:    'bg-blue-100 text-blue-700',
  DRAFT:     'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

const emptyRow = () => ({
  paymentId: '',
  billingProfileId: '',
  subtotal: '',
  tax: '',
  total: '',
  status: 'DRAFT',
});

export function AdminInvoicesPage() {
  const { data, isLoading }     = useAdminInvoices();
  const { data: payments = [] } = useAdminPayments();
  const create = useCreateInvoice();
  const update = useUpdateInvoice();
  const del    = useDeleteInvoice();

  type Row = ReturnType<typeof emptyRow> & { id?: string };
  const [modal, setModal] = useState<{ open: boolean; row: Row }>({ open: false, row: emptyRow() });

  function openCreate() { setModal({ open: true, row: emptyRow() }); }
  function openEdit(r: Invoice) {
    setModal({
      open: true,
      row: {
        id: r.id,
        paymentId: r.paymentId,
        billingProfileId: r.billingProfileId ?? '',
        subtotal: String(r.subtotal),
        tax: String(r.tax),
        total: String(r.total),
        status: r.status,
      },
    });
  }
  function close() { setModal({ open: false, row: emptyRow() }); }
  function set(p: Partial<Row>) { setModal((m) => ({ ...m, row: { ...m.row, ...p } })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, subtotal, tax, total, billingProfileId, ...rest } = modal.row;
    const payload: Record<string, unknown> = {
      ...rest,
      subtotal: Number(subtotal),
      tax: Number(tax),
      total: Number(total),
      billingProfileId: billingProfileId || null,
    };
    try {
      if (id) await update.mutateAsync({ id, ...payload });
      else     await create.mutateAsync(payload);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    {
      key: 'invoiceNumber', label: 'N° Factura',
      render: (r: Invoice) => <span className="font-mono font-bold">{r.invoiceNumber ?? r.id.slice(0, 8)}</span>,
    },
    {
      key: 'reservation', label: 'Reserva',
      render: (r: Invoice) =>
        r.payment?.reservation ? <span className="font-mono text-xs">#{r.payment.reservation.reservationCode}</span> : '—',
    },
    { key: 'subtotal', label: 'Subtotal', render: (r: Invoice) => `$${Number(r.subtotal).toFixed(2)}` },
    { key: 'tax',      label: 'IVA',      render: (r: Invoice) => `$${Number(r.tax).toFixed(2)}` },
    { key: 'total',    label: 'Total',    render: (r: Invoice) => <span className="font-semibold">${Number(r.total).toFixed(2)}</span> },
    {
      key: 'status', label: 'Estado',
      render: (r: Invoice) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Fecha',
      render: (r: Invoice) => {
        try { return format(new Date(r.createdAt), 'd MMM yyyy', { locale: es }); }
        catch { return '—'; }
      },
    },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Facturas"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['invoiceNumber', 'status']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar Factura' : 'Nueva Factura'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="Pago" required>
          <SelectInput value={modal.row.paymentId} onChange={(e) => set({ paymentId: e.target.value })} required>
            <option value="">Seleccionar pago</option>
            {(payments as any[]).map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.transactionId} — ${Number(p.amount).toFixed(2)} ({p.status})
              </option>
            ))}
          </SelectInput>
        </FormField>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Subtotal ($)" required>
            <TextInput type="number" min={0} step={0.01} value={modal.row.subtotal} onChange={(e) => set({ subtotal: e.target.value })} placeholder="0.00" required />
          </FormField>
          <FormField label="IVA ($)" required>
            <TextInput type="number" min={0} step={0.01} value={modal.row.tax} onChange={(e) => set({ tax: e.target.value })} placeholder="0.00" required />
          </FormField>
          <FormField label="Total ($)" required>
            <TextInput type="number" min={0} step={0.01} value={modal.row.total} onChange={(e) => set({ total: e.target.value })} placeholder="0.00" required />
          </FormField>
        </div>

        <FormField label="Estado" required>
          <SelectInput value={modal.row.status} onChange={(e) => set({ status: e.target.value })}>
            {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectInput>
        </FormField>
      </AdminFormModal>
    </>
  );
}
