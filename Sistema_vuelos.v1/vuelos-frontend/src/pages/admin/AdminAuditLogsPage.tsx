// src/pages/admin/AdminAuditLogsPage.tsx — Solo lectura
import { useState } from 'react';
import { useAdminAuditLogs } from '@/hooks/useAdmin';
import { Loader2, ShieldCheck, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLog {
  id: string;
  action: string;
  tableName: string;
  recordId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  userId?: string | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN:  'bg-purple-100 text-purple-700',
};

export function AdminAuditLogsPage() {
  const { data, isLoading } = useAdminAuditLogs();
  const [search, setSearch] = useState('');

  const logs: AuditLog[] = (data as AuditLog[] | undefined) ?? [];

  const filtered = search
    ? logs.filter((l) =>
        l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.tableName?.toLowerCase().includes(search.toLowerCase()) ||
        l.recordId?.toLowerCase().includes(search.toLowerCase()) ||
        l.userId?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
          {!isLoading && (
            <span className="text-sm text-gray-400 font-normal">
              {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-56"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Sin registros de auditoría</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Acción', 'Tabla', 'Record ID', 'Usuario ID', 'Fecha', 'Valores'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-700'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{log.tableName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.recordId ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.userId ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {log.createdAt
                      ? format(new Date(log.createdAt), "d MMM yyyy HH:mm", { locale: es })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {(log.oldValues || log.newValues) ? (
                      <details className="cursor-pointer">
                        <summary className="text-xs text-blue-600 hover:underline">Ver</summary>
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded max-w-xs overflow-auto max-h-32">
                          {JSON.stringify({ old: log.oldValues, new: log.newValues }, null, 2)}
                        </pre>
                      </details>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
