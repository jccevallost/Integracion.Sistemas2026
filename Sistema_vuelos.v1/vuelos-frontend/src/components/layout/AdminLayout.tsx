// src/components/layout/AdminLayout.tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Plane, MapPin, Building2, BookOpen, Users, LayoutDashboard,
  LogOut, ChevronRight, Globe, Building, PlaneTakeoff, Tag,
  Layers, CreditCard, FileText, Ticket, ShieldCheck, Wrench,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    label: 'General',
    items: [
      { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',   end: true },
    ],
  },
  {
    label: 'Vuelos',
    items: [
      { to: '/admin/flights',      icon: Plane,           label: 'Vuelos' },
      { to: '/admin/segments',     icon: Layers,          label: 'Segmentos' },
      { to: '/admin/flightclasses',icon: Tag,             label: 'Clases de Vuelo' },
    ],
  },
  {
    label: 'Geografía & Flota',
    items: [
      { to: '/admin/airports',     icon: MapPin,          label: 'Aeropuertos' },
      { to: '/admin/airlines',     icon: Building2,       label: 'Aerolíneas' },
      { to: '/admin/aircraft',     icon: PlaneTakeoff,    label: 'Aeronaves' },
      { to: '/admin/countries',    icon: Globe,           label: 'Países' },
      { to: '/admin/cities',       icon: Building,        label: 'Ciudades' },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { to: '/admin/reservations', icon: BookOpen,        label: 'Reservas' },
      { to: '/admin/boarding-passes', icon: Ticket,       label: 'Boarding Passes' },
      { to: '/admin/promotions',   icon: Tag,             label: 'Promociones' },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { to: '/admin/payments',     icon: CreditCard,      label: 'Pagos' },
      { to: '/admin/invoices',     icon: FileText,        label: 'Facturas' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/admin/services',     icon: Wrench,          label: 'Servicios' },
      { to: '/admin/users',        icon: Users,           label: 'Usuarios' },
      { to: '/admin/audit',        icon: ShieldCheck,     label: 'Auditoría' },
    ],
  },
];

export function AdminLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-gray-900 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2 text-white font-bold">
            <Plane className="w-5 h-5 text-blue-400" />
            <span>Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label, ...rest }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={'end' in rest ? (rest as any).end : undefined}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      )
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-40 flex-shrink-0" />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.firstName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.firstLastName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { clearAuth(); navigate('/login'); }}
            className="w-full flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors py-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Contenido ── */}
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
