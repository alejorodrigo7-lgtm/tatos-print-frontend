import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, FolderTree, Ticket, ArrowLeft,
  LogOut, Menu, X, Sparkles, User, Palette,
} from 'lucide-react';
import { useAuthStore } from '../../context/store';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/categorias', label: 'Categorías', icon: FolderTree },
  { to: '/admin/cupones', label: 'Cupones', icon: Ticket },
  { to: '/admin/personalizados', label: 'Personalizados', icon: Palette },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex">

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-dark-800 border-r border-neon-cyan/30
          transform transition-transform duration-300
          md:relative md:translate-x-0
          ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="p-6 border-b border-neon-cyan/20">
            <Link
              to="/admin"
              className="flex items-center gap-2"
              onClick={() => setSidebarAbierto(false)}
            >
              <Sparkles className="w-6 h-6 text-neon-pink" />
              <div>
                <span className="font-display text-lg font-black text-neon-cyan text-glow-cyan block leading-tight">
                  TATOS PRINT
                </span>
                <span className="text-[10px] uppercase tracking-widest text-neon-pink font-display">
                  Panel Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarAbierto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm transition-all ${
                    isActive
                      ? 'bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan font-bold'
                      : 'text-gray-400 hover:text-neon-cyan hover:bg-dark-700'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-neon-cyan/20 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-dark-700 rounded-lg">
              <User className="w-5 h-5 text-neon-pink flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">
                  {user?.nombre || 'Admin'}
                </p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>

            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-neon-cyan text-sm transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a la tienda
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-neon-pink text-sm transition"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay móvil */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/* ═══════════ CONTENIDO ═══════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar móvil */}
        <header className="md:hidden flex items-center justify-between p-4 bg-dark-800 border-b border-neon-cyan/30">
          <button
            onClick={() => setSidebarAbierto((v) => !v)}
            className="p-2 text-neon-cyan"
            aria-label="Menú"
          >
            {sidebarAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-display font-black text-neon-cyan">ADMIN</span>
          <div className="w-10" />
        </header>

        {/* Página */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;