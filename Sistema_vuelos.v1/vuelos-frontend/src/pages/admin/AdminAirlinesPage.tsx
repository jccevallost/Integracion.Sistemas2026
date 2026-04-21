// src/pages/admin/AdminAirlinesPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import {
  AdminFormModal, FormField, TextInput, SelectInput,
} from '@/components/admin/AdminFormModal';
import {
  useAdminAirlines, useCreateAirline, useUpdateAirline, useDeleteAirline,
  useAdminCountries,
} from '@/hooks/useAdmin';

interface Airline {
  id: string;
  iataCode: string;
  name: string;
  logoUrl?: string;
  countryId: string;
  country: { id: string; name: string; isoCode: string };
}

const empty = { iataCode: '', name: '', logoUrl: '', countryId: '' };

export function AdminAirlinesPage() {
  const { data, isLoading } = useAdminAirlines();
  const { data: countries = [] } = useAdminCountries();
  const create = useCreateAirline();
  const update = useUpdateAirline();
  const del    = useDeleteAirline();

  const [modal, setModal] = useState<{ open: boolean; row: typeof empty & { id?: string } }>({
    open: false,
    row: empty,
  });

  function openCreate() {
    setModal({ open: true, row: empty });
  }

  function openEdit(row: Airline) {
    setModal({
      open: true,
      row: {
        id: row.id,
        iataCode: row.iataCode,
        name: row.name,
        logoUrl: row.logoUrl ?? '',
        countryId: row.countryId ?? row.country?.id ?? '',
      },
    });
  }

  function close() {
    setModal({ open: false, row: empty });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, ...body } = modal.row;
    const payload = { ...body, logoUrl: body.logoUrl || undefined };
    try {
      if (id) {
        await update.mutateAsync({ id, ...payload });
      } else {
        await create.mutateAsync(payload);
      }
      close();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const columns = [
    {
      key: 'iataCode',
      label: 'IATA',
      render: (r: Airline) => (
        <span className="font-mono font-bold text-blue-600">{r.iataCode}</span>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      render: (r: Airline) => (
        <div className="flex items-center gap-2">
          {r.logoUrl && (
            <img src={r.logoUrl} alt={r.name} className="w-6 h-6 object-contain" />
          )}
          <span className="font-medium">{r.name}</span>
        </div>
      ),
    },
    {
      key: 'country',
      label: 'País',
      render: (r: Airline) => (
        <div>
          <div>{r.country?.name}</div>
          <div className="text-xs text-gray-500">{r.country?.isoCode}</div>
        </div>
      ),
    },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Aerolíneas"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['iataCode', 'name']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar Aerolínea' : 'Nueva Aerolínea'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="Código IATA" required>
          <TextInput
            value={modal.row.iataCode}
            onChange={(e) => setModal((m) => ({ ...m, row: { ...m.row, iataCode: e.target.value.toUpperCase() } }))}
            maxLength={3}
            placeholder="EJ: AA"
            required
          />
        </FormField>

        <FormField label="Nombre" required>
          <TextInput
            value={modal.row.name}
            onChange={(e) => setModal((m) => ({ ...m, row: { ...m.row, name: e.target.value } }))}
            placeholder="American Airlines"
            required
          />
        </FormField>

        <FormField label="País" required>
          <SelectInput
            value={modal.row.countryId}
            onChange={(e) => setModal((m) => ({ ...m, row: { ...m.row, countryId: e.target.value } }))}
            required
          >
            <option value="">Selecciona un país...</option>
            {countries.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="URL del Logo">
          <TextInput
            value={modal.row.logoUrl}
            onChange={(e) => setModal((m) => ({ ...m, row: { ...m.row, logoUrl: e.target.value } }))}
            placeholder="https://..."
            type="url"
          />
        </FormField>
      </AdminFormModal>
    </>
  );
}
