// src/pages/admin/AdminCitiesPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFormModal, FormField, TextInput, SelectInput } from '@/components/admin/AdminFormModal';
import {
  useAdminCities, useCreateCity, useUpdateCity, useDeleteCity,
  useAdminCountries,
} from '@/hooks/useAdmin';

interface City {
  id: string;
  name: string;
  iataCode?: string;
  countryId: string;
  country: { id: string; name: string };
}

const empty = { name: '', iataCode: '', countryId: '' };

export function AdminCitiesPage() {
  const { data, isLoading } = useAdminCities();
  const { data: countries = [] } = useAdminCountries();
  const create = useCreateCity();
  const update = useUpdateCity();
  const del    = useDeleteCity();

  const [modal, setModal] = useState<{ open: boolean; row: typeof empty & { id?: string } }>({
    open: false, row: empty,
  });

  function openCreate() { setModal({ open: true, row: empty }); }
  function openEdit(row: City) {
    setModal({ open: true, row: { id: row.id, name: row.name, iataCode: row.iataCode ?? '', countryId: row.countryId ?? row.country?.id ?? '' } });
  }
  function close() { setModal({ open: false, row: empty }); }

  function set(partial: Partial<typeof empty>) {
    setModal((m) => ({ ...m, row: { ...m.row, ...partial } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, ...body } = modal.row;
    const payload = { ...body, iataCode: body.iataCode || undefined };
    try {
      if (id) await update.mutateAsync({ id, ...payload });
      else     await create.mutateAsync(payload);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    { key: 'name',    label: 'Nombre', render: (r: City) => <span className="font-medium">{r.name}</span> },
    { key: 'iataCode', label: 'IATA',  render: (r: City) => r.iataCode ? <span className="font-mono text-blue-600">{r.iataCode}</span> : '—' },
    { key: 'country', label: 'País',   render: (r: City) => r.country?.name || '—' },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Ciudades"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['name', 'iataCode']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar Ciudad' : 'Nueva Ciudad'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="Nombre" required>
          <TextInput value={modal.row.name} onChange={(e) => set({ name: e.target.value })} placeholder="Bogotá" required />
        </FormField>
        <FormField label="País" required>
          <SelectInput value={modal.row.countryId} onChange={(e) => set({ countryId: e.target.value })} required>
            <option value="">Selecciona un país...</option>
            {countries.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Código IATA (opcional)">
          <TextInput value={modal.row.iataCode} onChange={(e) => set({ iataCode: e.target.value.toUpperCase() })} maxLength={3} placeholder="BOG" />
        </FormField>
      </AdminFormModal>
    </>
  );
}
