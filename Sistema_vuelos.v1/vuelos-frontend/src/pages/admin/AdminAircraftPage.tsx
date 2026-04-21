// src/pages/admin/AdminAircraftPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import {
  AdminFormModal, FormField, TextInput, SelectInput, CheckboxField,
} from '@/components/admin/AdminFormModal';
import {
  useAdminAircraft, useCreateAircraft, useUpdateAircraft, useDeleteAircraft,
  useAdminAirlines,
} from '@/hooks/useAdmin';

interface Aircraft {
  id: string;
  modelName: string;
  registration: string;
  hasWifi: boolean;
  hasUsb: boolean;
  airlineId: string;
  airline: { id: string; name: string; iataCode: string };
}

const empty = { airlineId: '', modelName: '', registration: '', hasWifi: false, hasUsb: false };

export function AdminAircraftPage() {
  const { data, isLoading } = useAdminAircraft();
  const { data: airlines = [] } = useAdminAirlines();
  const create = useCreateAircraft();
  const update = useUpdateAircraft();
  const del    = useDeleteAircraft();

  const [modal, setModal] = useState<{ open: boolean; row: typeof empty & { id?: string } }>({
    open: false, row: empty,
  });

  function openCreate() { setModal({ open: true, row: empty }); }
  function openEdit(row: Aircraft) {
    setModal({ open: true, row: { id: row.id, airlineId: row.airlineId ?? row.airline?.id ?? '', modelName: row.modelName, registration: row.registration, hasWifi: row.hasWifi, hasUsb: row.hasUsb } });
  }
  function close() { setModal({ open: false, row: empty }); }

  function set(partial: Partial<typeof empty>) {
    setModal((m) => ({ ...m, row: { ...m.row, ...partial } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, ...body } = modal.row;
    try {
      if (id) await update.mutateAsync({ id, ...body });
      else     await create.mutateAsync(body);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    { key: 'modelName',    label: 'Modelo',       render: (r: Aircraft) => <span className="font-medium">{r.modelName}</span> },
    { key: 'registration', label: 'Matrícula',     render: (r: Aircraft) => <span className="font-mono text-blue-600">{r.registration}</span> },
    { key: 'airline',      label: 'Aerolínea',     render: (r: Aircraft) => r.airline ? `${r.airline.name} (${r.airline.iataCode})` : '—' },
    {
      key: 'amenities',
      label: 'Amenidades',
      render: (r: Aircraft) => (
        <div className="flex gap-1">
          {r.hasWifi && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">WiFi</span>}
          {r.hasUsb  && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">USB</span>}
          {!r.hasWifi && !r.hasUsb && <span className="text-gray-400 text-xs">—</span>}
        </div>
      ),
    },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Aeronaves"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['modelName', 'registration']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar Aeronave' : 'Nueva Aeronave'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <FormField label="Aerolínea" required>
          <SelectInput value={modal.row.airlineId} onChange={(e) => set({ airlineId: e.target.value })} required>
            <option value="">Selecciona una aerolínea...</option>
            {airlines.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name} ({a.iataCode})</option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Modelo" required>
          <TextInput value={modal.row.modelName} onChange={(e) => set({ modelName: e.target.value })} placeholder="Boeing 737-800" required />
        </FormField>

        <FormField label="Matrícula" required>
          <TextInput value={modal.row.registration} onChange={(e) => set({ registration: e.target.value.toUpperCase() })} placeholder="N12345" required />
        </FormField>

        <div className="flex gap-6">
          <CheckboxField label="WiFi disponible" checked={modal.row.hasWifi} onChange={(e) => set({ hasWifi: e.target.checked })} />
          <CheckboxField label="USB disponible"  checked={modal.row.hasUsb}  onChange={(e) => set({ hasUsb: e.target.checked })} />
        </div>
      </AdminFormModal>
    </>
  );
}
