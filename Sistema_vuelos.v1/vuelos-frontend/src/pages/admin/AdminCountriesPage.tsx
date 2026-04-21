// src/pages/admin/AdminCountriesPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFormModal, FormField, TextInput } from '@/components/admin/AdminFormModal';
import {
  useAdminCountries, useCreateCountry, useUpdateCountry, useDeleteCountry,
} from '@/hooks/useAdmin';

interface Country {
  id: string;
  name: string;
  isoCode: string;
  phoneCode?: string;
  currencyCode?: string;
}

const empty = { name: '', isoCode: '', phoneCode: '', currencyCode: '' };

export function AdminCountriesPage() {
  const { data, isLoading } = useAdminCountries();
  const create = useCreateCountry();
  const update = useUpdateCountry();
  const del    = useDeleteCountry();

  const [modal, setModal] = useState<{ open: boolean; row: typeof empty & { id?: string } }>({
    open: false, row: empty,
  });

  function openCreate() { setModal({ open: true, row: empty }); }
  function openEdit(row: Country) {
    setModal({ open: true, row: { id: row.id, name: row.name, isoCode: row.isoCode, phoneCode: row.phoneCode ?? '', currencyCode: row.currencyCode ?? '' } });
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
      phoneCode: body.phoneCode || undefined,
      currencyCode: body.currencyCode || undefined,
    };
    try {
      if (id) await update.mutateAsync({ id, ...payload });
      else     await create.mutateAsync(payload);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    {
      key: 'isoCode',
      label: 'ISO',
      render: (r: Country) => (
        <span className="font-mono font-bold text-blue-600">{r.isoCode}</span>
      ),
    },
    { key: 'name',         label: 'Nombre',   render: (r: Country) => r.name },
    { key: 'phoneCode',    label: 'Cód. Tel.', render: (r: Country) => r.phoneCode || '—' },
    { key: 'currencyCode', label: 'Moneda',    render: (r: Country) => r.currencyCode || '—' },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Países"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['name', 'isoCode']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar País' : 'Nuevo País'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="Nombre" required>
          <TextInput value={modal.row.name} onChange={(e) => set({ name: e.target.value })} placeholder="Colombia" required />
        </FormField>
        <FormField label="Código ISO" required>
          <TextInput value={modal.row.isoCode} onChange={(e) => set({ isoCode: e.target.value.toUpperCase() })} maxLength={2} placeholder="CO" required />
        </FormField>
        <FormField label="Código Telefónico">
          <TextInput value={modal.row.phoneCode} onChange={(e) => set({ phoneCode: e.target.value })} placeholder="+57" />
        </FormField>
        <FormField label="Código de Moneda">
          <TextInput value={modal.row.currencyCode} onChange={(e) => set({ currencyCode: e.target.value.toUpperCase() })} maxLength={3} placeholder="COP" />
        </FormField>
      </AdminFormModal>
    </>
  );
}
