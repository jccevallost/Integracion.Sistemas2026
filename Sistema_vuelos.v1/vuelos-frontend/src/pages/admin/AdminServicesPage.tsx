// src/pages/admin/AdminServicesPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import { AdminFormModal, FormField, TextInput, SelectInput } from '@/components/admin/AdminFormModal';
import {
  useAdminServices, useCreateService, useUpdateService, useDeleteService,
} from '@/hooks/useAdmin';

interface ServiceCatalog {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string | null;
}

const CATEGORIES = ['BAGGAGE', 'MEAL', 'SEAT', 'ENTERTAINMENT', 'LOUNGE', 'INSURANCE', 'TRANSPORT', 'OTRO'];
const CATEGORY_COLORS: Record<string, string> = {
  BAGGAGE:       'bg-amber-100 text-amber-700',
  MEAL:          'bg-green-100 text-green-700',
  SEAT:          'bg-blue-100 text-blue-700',
  ENTERTAINMENT: 'bg-purple-100 text-purple-700',
  LOUNGE:        'bg-pink-100 text-pink-700',
  INSURANCE:     'bg-cyan-100 text-cyan-700',
  TRANSPORT:     'bg-orange-100 text-orange-700',
  OTRO:          'bg-gray-100 text-gray-700',
};

const emptyRow = () => ({
  name: '',
  code: '',
  category: 'BAGGAGE',
  description: '',
});

export function AdminServicesPage() {
  const { data, isLoading } = useAdminServices();
  const create = useCreateService();
  const update = useUpdateService();
  const del    = useDeleteService();

  type Row = ReturnType<typeof emptyRow> & { id?: string };
  const [modal, setModal] = useState<{ open: boolean; row: Row }>({ open: false, row: emptyRow() });

  function openCreate() { setModal({ open: true, row: emptyRow() }); }
  function openEdit(r: ServiceCatalog) {
    setModal({
      open: true,
      row: {
        id: r.id,
        name: r.name,
        code: r.code,
        category: r.category,
        description: r.description ?? '',
      },
    });
  }
  function close() { setModal({ open: false, row: emptyRow() }); }
  function set(p: Partial<Row>) { setModal((m) => ({ ...m, row: { ...m.row, ...p } })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { id, description, ...rest } = modal.row;
    // Solo enviamos campos que existen en el modelo Prisma: name, code, category, description
    const payload = { ...rest, description: description || null };
    try {
      if (id) await update.mutateAsync({ id, ...payload });
      else     await create.mutateAsync(payload);
      close();
    } catch (err: any) { alert(err.message); }
  }

  const columns = [
    { key: 'code', label: 'Código', render: (r: ServiceCatalog) => <span className="font-mono font-bold text-blue-600">{r.code}</span> },
    { key: 'name', label: 'Nombre', render: (r: ServiceCatalog) => r.name },
    {
      key: 'category', label: 'Categoría',
      render: (r: ServiceCatalog) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[r.category] ?? 'bg-gray-100 text-gray-700'}`}>
          {r.category}
        </span>
      ),
    },
    { key: 'description', label: 'Descripción', render: (r: ServiceCatalog) => r.description ?? '—' },
  ];

  const isSaving = create.isPending || update.isPending;

  return (
    <>
      <AdminTable
        title="Catálogo de Servicios"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['code', 'name', 'category']}
      />

      <AdminFormModal
        title={modal.row.id ? 'Editar Servicio' : 'Nuevo Servicio'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nombre" required>
            <TextInput value={modal.row.name} onChange={(e) => set({ name: e.target.value })} placeholder="Equipaje adicional" required />
          </FormField>
          <FormField label="Código" required>
            <TextInput value={modal.row.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} placeholder="BAG_EXTRA" required />
          </FormField>
        </div>

        <FormField label="Categoría" required>
          <SelectInput value={modal.row.category} onChange={(e) => set({ category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </SelectInput>
        </FormField>

        <FormField label="Descripción">
          <TextInput value={modal.row.description} onChange={(e) => set({ description: e.target.value })} placeholder="Descripción del servicio..." />
        </FormField>
      </AdminFormModal>
    </>
  );
}
