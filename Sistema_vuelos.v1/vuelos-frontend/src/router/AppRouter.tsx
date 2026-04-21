// src/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

// Layouts
import { MainLayout }  from '@/components/layout/MainLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Páginas públicas
import { LoginPage }    from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Páginas cliente
import { HomePage }              from '@/pages/flights/HomePage';
import { SearchPage }            from '@/pages/flights/SearchPage';
import { ResultsPage }           from '@/pages/flights/ResultsPage';
import { FlightDetailPage }      from '@/pages/flights/FlightDetailPage';
import { ReservationPage }       from '@/pages/reservations/ReservationPage';
import { MyTripsPage }           from '@/pages/reservations/MyTripsPage';
import { ReservationDetailPage } from '@/pages/reservations/ReservationDetailPage';

// Páginas admin — existentes
import { AdminDashboardPage }    from '@/pages/admin/AdminDashboardPage';
import { AdminFlightsPage }      from '@/pages/admin/AdminFlightsPage';
import { AdminAirportsPage }     from '@/pages/admin/AdminAirportsPage';
import { AdminAirlinesPage }     from '@/pages/admin/AdminAirlinesPage';
import { AdminAircraftPage }     from '@/pages/admin/AdminAircraftPage';
import { AdminCountriesPage }    from '@/pages/admin/AdminCountriesPage';
import { AdminCitiesPage }       from '@/pages/admin/AdminCitiesPage';
import { AdminPromotionsPage }   from '@/pages/admin/AdminPromotionsPage';
import { AdminReservationsPage } from '@/pages/admin/AdminReservationsPage';
import { AdminUsersPage }        from '@/pages/admin/AdminUsersPage';

// Páginas admin — nuevas
import { AdminSegmentsPage }      from '@/pages/admin/AdminSegmentsPage';
import { AdminFlightClassesPage } from '@/pages/admin/AdminFlightClassesPage';
import { AdminPaymentsPage }      from '@/pages/admin/AdminPaymentsPage';
import { AdminInvoicesPage }      from '@/pages/admin/AdminInvoicesPage';
import { AdminBoardingPassesPage } from '@/pages/admin/AdminBoardingPassesPage';
import { AdminAuditLogsPage }     from '@/pages/admin/AdminAuditLogsPage';
import { AdminServicesPage }      from '@/pages/admin/AdminServicesPage';

// ── Guards ────────────────────────────────────────────────────
function RequireAuth() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return <Outlet />;
}

function RequireGuest() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (isAuthenticated) return <Navigate to={isAdmin() ? '/admin' : '/'} replace />;
  return <Outlet />;
}

// ── Router ────────────────────────────────────────────────────
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Rutas públicas (solo si NO está logueado) ── */}
        <Route element={<RequireGuest />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Rutas cliente (layout principal) ── */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/search"      element={<SearchPage />} />
          <Route path="/results"     element={<ResultsPage />} />
          <Route path="/flights/:id" element={<FlightDetailPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/reservations/new/:flightClassId" element={<ReservationPage />} />
            <Route path="/my-trips"                        element={<MyTripsPage />} />
            <Route path="/my-trips/:id"                    element={<ReservationDetailPage />} />
          </Route>
        </Route>

        {/* ── Rutas admin ── */}
        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            {/* Core */}
            <Route path="/admin"                element={<AdminDashboardPage />} />
            {/* Vuelos */}
            <Route path="/admin/flights"        element={<AdminFlightsPage />} />
            <Route path="/admin/segments"       element={<AdminSegmentsPage />} />
            <Route path="/admin/flightclasses"  element={<AdminFlightClassesPage />} />
            {/* Geografía & Flota */}
            <Route path="/admin/airports"       element={<AdminAirportsPage />} />
            <Route path="/admin/airlines"       element={<AdminAirlinesPage />} />
            <Route path="/admin/aircraft"       element={<AdminAircraftPage />} />
            <Route path="/admin/countries"      element={<AdminCountriesPage />} />
            <Route path="/admin/cities"         element={<AdminCitiesPage />} />
            {/* Operaciones */}
            <Route path="/admin/reservations"   element={<AdminReservationsPage />} />
            <Route path="/admin/boarding-passes" element={<AdminBoardingPassesPage />} />
            <Route path="/admin/promotions"     element={<AdminPromotionsPage />} />
            {/* Finanzas */}
            <Route path="/admin/payments"       element={<AdminPaymentsPage />} />
            <Route path="/admin/invoices"       element={<AdminInvoicesPage />} />
            {/* Sistema */}
            <Route path="/admin/services"       element={<AdminServicesPage />} />
            <Route path="/admin/users"          element={<AdminUsersPage />} />
            <Route path="/admin/audit"          element={<AdminAuditLogsPage />} />
          </Route>
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
