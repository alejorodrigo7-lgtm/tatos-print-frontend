import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout público
import Layout from './components/Layout';

// Páginas públicas
import Home from './pages/Home';
import Tienda from './pages/Tienda';
import ProductoDetalle from './pages/ProductoDetalle';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Registro from './pages/Registro';
import MisPedidos from './pages/MisPedidos';
import Seguimiento from './pages/Seguimiento';
import Personalizados from './pages/Personalizados';

// Panel Admin
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductosAdmin from './pages/admin/ProductosAdmin';
import PedidosAdmin from './pages/admin/PedidosAdmin';
import CategoriasAdmin from './pages/admin/CategoriasAdmin';
import CuponesAdmin from './pages/admin/CuponesAdmin';
import PersonalizadosAdmin from './pages/admin/PersonalizadosAdmin';

// Página 404
const NotFound = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-dark-900 bg-grid">
    <div className="text-center px-4">
      <h1 className="font-display text-8xl font-black text-neon-pink text-glow-pink">
        404
      </h1>
      <p className="text-gray-400 mt-4 font-body text-lg">
        Página no encontrada
      </p>
      <a
        href="/"
        className="inline-block mt-6 px-6 py-3 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition"
      >
        Volver al inicio
      </a>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ═══════════ RUTAS PÚBLICAS (con Layout) ═══════════ */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/mis-pedidos" element={<MisPedidos />} />
          <Route path="/seguimiento" element={<Seguimiento />} />
          <Route path="/personalizados" element={<Personalizados />} />

          {/* 404 dentro del Layout */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ═══════════ RUTAS ADMIN (con ProtectedRoute + AdminLayout) ═══════════ */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<ProductosAdmin />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="categorias" element={<CategoriasAdmin />} />
          <Route path="cupones" element={<CuponesAdmin />} />
          <Route path="personalizados" element={<PersonalizadosAdmin />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;