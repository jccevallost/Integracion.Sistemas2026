// src/pages/admin/AdminPromotionsPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import {
  AdminFormModal, FormField, TextInput, SelectInput, CheckboxField,
} from '@/components/admin/AdminFormModal';
import {
  useAdminPromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion,
} from '@/hooks/useAdmin';

interface Promotion {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  isActive: boolean;
  maxUsages?: number;
  currentUsages?: number;
}

const empty = {
  code: '',
  discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
  discountValue: 0,
  isActive: true,
  maxUsages: '',
};

export function AdminPromotionsPage() {
  const { data, isLoading } = useAdminPromotions();
  const create = useCreatePromotion();
  const update = useUpdatePromotion();
  const del    = useDeletePromotion();

  const [modal, setModal] = useState<{
    open: boolean;
    row: typeof empty & { id?: string };
  }>({ open: false, row: empty });

  function openCreate() { setModal({ open: true, row: empty }); }
  function openEdit(row: Promotion) {
    setModal({
      open: true,
      row: {
        id: row.id,
        code: row.code,
        discountType: row.discountType,
        discountValue: row.discountValue,
        isActive: row.isActive,
        maxUsages: row.maxUsages != null ? String(row.maxUsages) : '',
      },
    });
  }
  function close() { setModal({ open: false, row: empty }); }

  function set(partial: Partial<typeof empty>) {
    setModal((m) => ({ ...m, row: { ...m.row, ...partial } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, ...body } = modal.row;
    const payload = {
      ...body,
      discountValue: Number(body.discountValue),
      maxUsages: body.maxUsages !== '' ? Number(body.maxUsages) : undefined,
    };
    try {
      if (id) await update.mutateAsync({ id, ...payload });
      else     await create.mutateAsync(payload);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    {
      key: 'code',
      label: 'Código',
      render: (r: Promotion) => (
        <span className="font-mono font-bold text-blue-600">{r.code}</span>
      ),
    },
    {
      key: 'discountType',
      label: 'Tipo',
      render: (r: Promotion) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          r.discountType === 'PERCENTAGE' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {r.discountType === 'PERCENTAGE' ? '%' : '$'} {r.discountType}
        </span>
      ),
    },
    {
      key: 'discountValue',
      label: 'Descuento',
      render: (r: Promotion) =>
        r.discountType === 'PERCENTAGE'
          ? `${r.discountValue}%`
          : `$${Number(r.discountValue).toFixed(2)}`,
    },
    {
      key: 'usages',
      label: 'Usos',
      render: (r: Promotion) =>
        r.maxUsages != null
          ? `${r.currentUsages ?? 0} / ${r.maxUsages}`
          : `${r.currentUsages ?? 0} / ∞`,
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (r: Promotion) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {r.isActive ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Promociones"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['code']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar Promoción' : 'Nueva Promoción'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="Código" required>
          <TextInput
            value={modal.row.code}
            onChange={(e) => set({ code: e.target.value.toUpperCase() })}
            placeholder="PROMO20"
            required
          />
        </FormField>

        <FormField label="Tipo de Descuento" required>
          <SelectInput
            value={modal.row.discountType}
            onChange={(e) => set({ discountType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
          >
            <option value="PERCENTAGE">Porcentaje (%)</option>
            <option value="FIXED_AMOUNT">Monto Fijo ($)</option>
          </SelectInput>
        </FormField>

        <FormField label={`Valor del Descuento ${modal.row.discountType === 'PERCENTAGE' ? '(%)' : '($)'}`} required>
          <TextInput
            type="number"
            min={0}
            max={modal.row.discountType === 'PERCENTAGE' ? 100 : undefined}
            step={modal.row.discountType === 'PERCENTAGE' ? 1 : 0.01}
            value={modal.row.discountValue}
            onChange={(e) => set({ discountValue: e.target.value as any })}
            required
          />
        </FormField>

        <FormField label="Máximo de Usos (dejar vacío = ilimitado)">
          <TextInput
            type="number"
            min={1}
            value={modal.row.maxUsages}
            onChange={(e) => set({ maxUsages: e.target.value as any })}
            placeholder="100"
          />
        </FormField>

        <CheckboxField
          label="Promoción activa"
          checked={modal.row.isActive}
          onChange={(e) => set({ isActive: e.target.checked })}
        />
      </AdminFormModal>
    </>
  );
}
