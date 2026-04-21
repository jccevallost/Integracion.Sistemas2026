// src/components/admin/AdminTable.tsx
// Tabla genérica CRUD reutilizable en todos los módulos admin
import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface AdminTableProps<T extends { id: string }> {
  title: string;
  data: T[] | undefined;
  columns: Column<T>[];
  isLoading: boolean;
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  searchKeys?: (keyof T)[];
}

export function AdminTable<T extends { id: string }>({
  title, data, columns, isLoading, onAdd, onEdit, onDelete, isDeleting, searchKeys = [],
}: AdminTableProps<T>) {
  const [search, setSearch] = useState('');

  const filtered = (data ?? []).filter((row) => {
    if (!search) return true;
    return searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        )}
      </div>

      {searchKeys.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Sin registros</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map((col) => (
                    <th key={String(col.key)} className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">
                      {col.label}
                    </th>
                  ))}
                  {(onEdit || onDelete) && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-4 py-3 text-gray-700">
                        {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          {onEdit && (
                            <button onClick={() => onEdit(row)} className="text-gray-400 hover:text-blue-600 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => { if (confirm('¿Eliminar este registro?')) onDelete(row.id); }}
                              disabled={isDeleting}
                              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
