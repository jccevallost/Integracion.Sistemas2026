// src/components/layout/MainLayout.tsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Plane, Search, Briefcase, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export function MainLayout() {
  const { isAuthenticated, user, clearAuth, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Navbar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-blue-600 text-lg">
              <Plane className="w-5 h-5" />
              VuelosApp
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link to="/search" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <Search className="w-4 h-4" />
                Buscar vuelos
              </Link>
              {isAuthenticated && (
                <Link to="/my-trips" className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Briefcase className="w-4 h-4" />
                  Mis viajes
                </Link>
              )}
              {isAdmin() && (
                <Link to="/admin" className="flex items-center gap-1.5 hover:text-purple-600 transition-colors text-purple-500">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Auth */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                      {user?.firstName.charAt(0).toUpperCase()}
                    </div>
                    <span>{user?.firstName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        VuelosApp © {new Date().getFullYear()} · Plataforma académica
      </footer>
    </div>
  );
}
