// src/pages/admin/AdminUsersPage.tsx
import { useState } from 'react';
import { AdminTable } from '@/components/admin/AdminTable';
import {
  AdminFormModal, FormField, TextInput, SelectInput, CheckboxField,
} from '@/components/admin/AdminFormModal';
import { useAdminUsers, useCreateUser, useUpdateUser, useDeleteUser, useAdminCities } from '@/hooks/useAdmin';

interface User {
  id: string;
  email: string;
  firstName: string;
  secondName?: string;
  firstLastName?: string;
  secondLastName?: string;
  mainAddress?: string;
  secondaryAddress?: string;
  cityId?: string;
  phone?: string;
  birthDate?: string | null;
  role: string;
  isActive: boolean;
  city?: { id: string; name: string; country?: { name: string } };
}

function makeEmpty(row?: User) {
  return {
    email:             row?.email             ?? '',
    firstName:         row?.firstName         ?? '',
    secondName:        row?.secondName        ?? '',
    firstLastName:     row?.firstLastName     ?? '',
    secondLastName:    row?.secondLastName    ?? '',
    mainAddress:       row?.mainAddress       ?? '',
    secondaryAddress:  row?.secondaryAddress  ?? '',
    cityId:            row?.cityId ?? row?.city?.id ?? '',
    phone:             row?.phone             ?? '',
    birthDate:         row?.birthDate ? row.birthDate.split('T')[0] : '',
    role:              row?.role              ?? 'CUSTOMER',
    isActive:          row?.isActive          ?? true,
    password:          '',
  };
}

export function AdminUsersPage() {
  const { data, isLoading }  = useAdminUsers();
  const { data: cities = [] } = useAdminCities();
  const create = useCreateUser();
  const update = useUpdateUser();
  const del    = useDeleteUser();

  const [modal, setModal] = useState<{
    open: boolean;
    id: string | null;
    row: ReturnType<typeof makeEmpty>;
  }>({ open: false, id: null, row: makeEmpty() });

  function openCreate() { setModal({ open: true, id: null, row: makeEmpty() }); }
  function openEdit(row: User) { setModal({ open: true, id: row.id, row: makeEmpty(row) }); }
  function close() { setModal({ open: false, id: null, row: makeEmpty() }); }
  function set(p: Partial<ReturnType<typeof makeEmpty>>) {
    setModal((m) => ({ ...m, row: { ...m.row, ...p } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { password, birthDate, secondaryAddress, secondName, secondLastName, ...rest } = modal.row;

    // Solo incluir opcionales si tienen valor
    const body: Record<string, unknown> = {
      ...rest,
      ...(secondName        ? { secondName }        : {}),
      ...(secondLastName    ? { secondLastName }    : {}),
      ...(secondaryAddress  ? { secondaryAddress }  : {}),
      ...(birthDate         ? { birthDate: new Date(birthDate).toISOString() } : {}),
    };

    try {
      if (modal.id) {
        if (password) body.password = password;
        await update.mutateAsync({ id: modal.id, ...body });
      } else {
        await create.mutateAsync({ ...body, password });
      }
      close();
    } catch (err: any) { alert(err.message); }
  }

  const isEditing = modal.id !== null;
  const isSaving  = create.isPending || update.isPending;

  const columns = [
    {
      key: 'name',
      label: 'Nombre Completo',
      render: (r: User) => {
        const full = [r.firstName, r.secondName, r.firstLastName, r.secondLastName]
          .filter(Boolean).join(' ');
        return <span className="font-medium">{full}</span>;
      },
    },
    { key: 'email', label: 'Email', render: (r: User) => r.email },
    {
      key: 'city',
      label: 'Ciudad',
      render: (r: User) =>
        r.city ? `${r.city.name}${r.city.country ? `, ${r.city.country.name}` : ''}` : '—',
    },
    {
      key: 'role',
      label: 'Rol',
      render: (r: User) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          r.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {r.role}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (r: User) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {r.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminTable
        title="Usuarios"
        data={data}
        columns={columns}
        isLoading={isLoading}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={(id) => del.mutate(id)}
        isDeleting={del.isPending}
        searchKeys={['email', 'firstName', 'firstLastName']}
      />

      <AdminFormModal
        title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
        open={modal.open}
        onClose={close}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      >
        {/* ── Identidad ── */}
        <FormField label="Email" required>
          <TextInput
            type="email"
            value={modal.row.email}
            onChange={(e) => set({ email: e.target.value })}
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Primer Nombre" required>
            <TextInput
              value={modal.row.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
              placeholder="Juan"
              required
            />
          </FormField>
          <FormField label="Segundo Nombre">
            <TextInput
              value={modal.row.secondName}
              onChange={(e) => set({ secondName: e.target.value })}
              placeholder="Carlos"
            />
          </FormField>
          <FormField label="Primer Apellido" required>
            <TextInput
              value={modal.row.firstLastName}
              onChange={(e) => set({ firstLastName: e.target.value })}
              placeholder="Pérez"
              required
            />
          </FormField>
          <FormField label="Segundo Apellido">
            <TextInput
              value={modal.row.secondLastName}
              onChange={(e) => set({ secondLastName: e.target.value })}
              placeholder="García"
            />
          </FormField>
        </div>

        {/* ── Contacto ── */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Teléfono">
            <TextInput
              value={modal.row.phone}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder="+593 99 000 0000"
            />
          </FormField>
          <FormField label="Fecha de Nacimiento">
            <TextInput
              type="date"
              value={modal.row.birthDate}
              onChange={(e) => set({ birthDate: e.target.value })}
            />
          </FormField>
        </div>

        {/* ── Ubicación ── */}
        <FormField label="Ciudad" required>
          <SelectInput
            value={modal.row.cityId}
            onChange={(e) => set({ cityId: e.target.value })}
            required
          >
            <option value="">Seleccionar ciudad</option>
            {(cities as any[]).map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.country ? ` — ${c.country.name}` : ''}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Dirección Principal" required>
          <TextInput
            value={modal.row.mainAddress}
            onChange={(e) => set({ mainAddress: e.target.value })}
            placeholder="Av. Amazonas N25-100"
            required
          />
        </FormField>

        <FormField label="Dirección Secundaria">
          <TextInput
            value={modal.row.secondaryAddress}
            onChange={(e) => set({ secondaryAddress: e.target.value })}
            placeholder="Depto. 4B (opcional)"
          />
        </FormField>

        {/* ── Cuenta ── */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Rol" required>
            <SelectInput value={modal.row.role} onChange={(e) => set({ role: e.target.value })}>
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="ADMIN">ADMIN</option>
            </SelectInput>
          </FormField>
          <FormField
            label={isEditing ? 'Nueva Contraseña' : 'Contraseña'}
            required={!isEditing}
          >
            <TextInput
              type="password"
              value={modal.row.password}
              onChange={(e) => set({ password: e.target.value })}
              placeholder={isEditing ? 'Dejar vacío = sin cambio' : '••••••••'}
              required={!isEditing}
            />
          </FormField>
        </div>

        <CheckboxField
          label="Usuario activo"
          checked={modal.row.isActive}
          onChange={(e) => set({ isActive: e.target.checked })}
        />
      </AdminFormModal>
    </>
  );
}
