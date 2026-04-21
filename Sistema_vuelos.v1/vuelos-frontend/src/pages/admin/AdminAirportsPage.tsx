// src/pages/admin/AdminAirportsPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import {
  AdminFormModal, FormField, TextInput, SelectInput,
} from '@/components/admin/AdminFormModal';
import {
  useAdminAirports, useCreateAirport, useUpdateAirport, useDeleteAirport,
  useAdminCities,
} from '@/hooks/useAdmin';

interface Airport {
  id: string;
  iataCode: string;
  name: string;
  cityId: string;
  timezone: string;
  city: { id: string; name: string; country: { name: string } };
}

const empty = { iataCode: '', name: '', cityId: '', timezone: '' };

export function AdminAirportsPage() {
  const { data, isLoading } = useAdminAirports();
  const { data: cities = [] } = useAdminCities();
  const create = useCreateAirport();
  const update = useUpdateAirport();
  const del    = useDeleteAirport();

  const [modal, setModal] = useState<{ open: boolean; row: typeof empty & { id?: string } }>({
    open: false,
    row: empty,
  });

  function openCreate() {
    setModal({ open: true, row: empty });
  }

  function openEdit(row: Airport) {
    setModal({
      open: true,
      row: {
        id: row.id,
        iataCode: row.iataCode,
        name: row.name,
        cityId: row.cityId ?? row.city?.id ?? '',
        timezone: row.timezone,
      },
    });
  }

  function close() {
    setModal({ open: false, row: empty });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, ...body } = modal.row;
    try {
      if (id) {
        await update.mutateAsync({ id, ...body });
      } else {
        await create.mutateAsync(body);
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
      render: (r: Airport) => (
        <span className="font-mono font-bold text-blue-600">{r.iataCode}</span>
      ),
    },
    { key: 'name', label: 'Nombre', render: (r: Airport) => r.name },
    { key: 'city',    label: 'Ciudad',      render: (r: Airport) => r.city?.name || '—' },
    { key: 'country', label: 'País',        render: (r: Airport) => r.city?.country?.name || '—' },
    { key: 'timezone', label: 'Zona Horaria', render: (r: Airport) => r.timezone },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Aeropuertos"
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
        title={modal.row.id ? 'Editar Aeropuerto' : 'Nuevo Aeropuerto'}
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
            placeholder="EJ: JFK"
            required
          />
        </FormField>

        <FormField label="Nombre" required>
          <TextInput
            value={modal.row.name}
            onChange={(e) => setModal((m) => ({ ...m, row: { ...m.row, name: e.target.value } }))}
            placeholder="John F. Kennedy International"
            required
          />
        </FormField>

        <FormField label="Ciudad" required>
          <SelectInput
            value={modal.row.cityId}
            onChange={(e) => setModal((m) => ({ ...m, row: { ...m.row, cityId: e.target.value } }))}
            required
          >
            <option value="">Selecciona una ciudad...</option>
            {cities.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.country ? ` — ${c.country.name}` : ''}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Zona Horaria" required>
          <TextInput
            value={modal.row.timezone}
            onChange={(e) => setModal((m) => ({ ...m, row: { ...m.row, timezone: e.target.value } }))}
            placeholder="America/New_York"
            required
          />
        </FormField>
      </AdminFormModal>
    </>
  );
}
