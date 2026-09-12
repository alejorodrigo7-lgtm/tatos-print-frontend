import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Sparkles, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore, useCartStore } from '../context/store';

const Header = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { user, logout } = useAuthStore();
  const count = useCartStore((s) => s.getCount());

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/tienda', label: 'Tienda' },
    { to: '/personalizados', label: 'Personalizados' },
    { to: '/seguimiento', label: 'Seguimiento' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-dark-900/90 backdrop-blur-md border-b border-neon-cyan/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-neon-pink group-hover:animate-pulse" />
            <span className="font-display text-xl md:text-2xl font-black text-neon-cyan text-glow-cyan">
              TATOS PRINT
            </span>
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-body text-sm uppercase tracking-wider transition-all ${
                    isActive
                      ? 'text-neon-pink text-glow-pink'
                      : 'text-gray-300 hover:text-neon-cyan'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* ACCIONES */}
          <div className="flex items-center gap-3 md:gap-4">

            {/* Buscar (desktop) */}
            <Link
              to="/tienda"
              className="hidden md:flex p-2 text-gray-300 hover:text-neon-cyan transition"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Carrito */}
            <Link
              to="/carrito"
              className="relative p-2 text-gray-300 hover:text-neon-cyan transition"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-neon-pink text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-neon-pink">
                  {count}
                </span>
              )}
            </Link>

            {/* Admin */}
            {(user?.rol === 'admin' || user?.esAdmin === true) && (
              <Link
                to="/admin"
                className="hidden md:inline-block px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-neon-yellow text-neon-yellow rounded hover:bg-neon-yellow hover:text-black transition shadow-neon-cyan"
              >
                Admin
              </Link>
            )}

            {/* Login / Usuario */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/mis-pedidos"
                  className="hidden md:flex items-center gap-2 text-sm text-gray-300 hover:text-neon-cyan transition"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.nombre || user.email}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-300 hover:text-neon-pink transition"
                  aria-label="Cerrar sesiÃ³n"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-block px-4 py-1.5 text-sm font-bold uppercase tracking-wider bg-neon-cyan text-black rounded hover:bg-neon-pink hover:text-white transition shadow-neon-cyan"
              >
                Ingresar
              </Link>
            )}

            {/* BotÃ³n menÃº mÃ³vil */}
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              className="md:hidden p-2 text-neon-cyan"
              aria-label="MenÃº"
            >
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÃš MÃ“VIL */}
      {menuAbierto && (
        <div className="md:hidden border-t border-neon-cyan/20 bg-dark-800">
          <nav className="flex flex-col px-4 py-4 gap-4">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMenuAbierto(false)}
                className={({ isActive }) =>
                  `text-sm uppercase tracking-wider ${
                    isActive ? 'text-neon-pink text-glow-pink' : 'text-gray-300'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link
                  to="/mis-pedidos"
                  onClick={() => setMenuAbierto(false)}
                  className="text-sm uppercase tracking-wider text-gray-300"
                >
                  Mis pedidos
                </Link>
                {(user?.rol === 'admin' || user?.esAdmin === true) && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuAbierto(false)}
                    className="text-sm uppercase tracking-wider text-neon-yellow"
                  >
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMenuAbierto(false);
                  }}
                  className="text-left text-sm uppercase tracking-wider text-neon-pink"
                >
                  Cerrar sesiÃ³n
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuAbierto(false)}
                className="text-sm uppercase tracking-wider text-neon-cyan"
              >
                Ingresar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;