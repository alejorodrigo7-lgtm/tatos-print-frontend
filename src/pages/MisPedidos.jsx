import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, ArrowRight, ShoppingBag, Calendar, DollarSign, Truck,
  CheckCircle, Clock, XCircle, AlertCircle, Sparkles,
} from 'lucide-react';
import { pedidosAPI } from '../services/api';
import { useAuthStore } from '../context/store';

// Colores según estado
const ESTADOS = {
  pendiente: { color: 'yellow', icon: Clock, label: 'Pendiente' },
  confirmado: { color: 'cyan', icon: CheckCircle, label: 'Confirmado' },
  preparando: { color: 'purple', icon: Package, label: 'Preparando' },
  enviado: { color: 'cyan', icon: Truck, label: 'Enviado' },
  entregado: { color: 'green', icon: CheckCircle, label: 'Entregado' },
  cancelado: { color: 'pink', icon: XCircle, label: 'Cancelado' },
};

const MisPedidos = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/mis-pedidos', { replace: true });
      return;
    }

    pedidosAPI
      .misPedidos()
      .then((res) => {
        const data = res.data.pedidos || res.data || [];
        setPedidos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Error pedidos:', err);
        setError(
          err.response?.data?.mensaje ||
            err.response?.data?.message ||
            'No pudimos cargar tus pedidos'
        );
      })
      .finally(() => setCargando(false));
  }, [user, navigate]);

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    try {
      return new Date(fecha).toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // ═══════════ CARGANDO ═══════════
  if (cargando) {
    return (
      <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4 font-body">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ENCABEZADO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display text-4xl md:text-6xl font-black text-white">
            MIS <span className="text-neon-cyan text-glow-cyan">PEDIDOS</span>
          </h1>
          <p className="text-gray-400 mt-3 font-body">
            Hola <span className="text-neon-pink font-bold">{user?.nombre || 'cliente'}</span>, aquí
            está tu historial de compras
          </p>
        </motion.div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-2 p-4 bg-neon-pink/10 border border-neon-pink/40 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-neon-pink flex-shrink-0 mt-0.5" />
            <p className="text-neon-pink text-sm font-body">{error}</p>
          </div>
        )}

        {/* SIN PEDIDOS */}
        {!error && pedidos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-dark-800 border border-neon-cyan/20 rounded-2xl"
          >
            <ShoppingBag className="w-20 h-20 text-neon-cyan mx-auto mb-6 opacity-40" />
            <h2 className="font-display text-2xl text-white mb-3">
              Todavía no tienes pedidos
            </h2>
            <p className="text-gray-400 font-body mb-8 max-w-md mx-auto">
              Explora nuestra tienda y haz tu primer pedido de figuras 3D.
            </p>
            <Link
              to="/tienda"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition shadow-neon-cyan"
            >
              Ir a la tienda
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* LISTA DE PEDIDOS */}
        {pedidos.length > 0 && (
          <div className="space-y-5">
            {pedidos.map((pedido, i) => {
              const estado = ESTADOS[pedido.estado] || ESTADOS.pendiente;
              const IconEstado = estado.icon;
              const total = Number(pedido.total || 0);

              return (
                <motion.div
                  key={pedido._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-dark-800 border border-neon-cyan/20 rounded-xl overflow-hidden hover:border-neon-cyan/50 transition"
                >
                  {/* HEADER DEL PEDIDO */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-neon-cyan/10">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-display">
                        Código
                      </p>
                      <p className="font-display text-lg font-black text-neon-yellow">
                        {pedido.codigoPedido || pedido.codigoPedido || pedido.codigo || `#${pedido._id?.slice(-6).toUpperCase()}`}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-display">
                        Fecha
                      </p>
                      <p className="text-white font-body text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatearFecha(pedido.createdAt || pedido.fecha)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-display">
                        Total
                      </p>
                      <p className="font-display text-lg font-bold text-neon-green flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {total.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-1">
                        Estado
                      </p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-display font-bold uppercase tracking-wider bg-neon-${estado.color}/10 border border-neon-${estado.color}/50 text-neon-${estado.color} rounded-full`}
                      >
                        <IconEstado className="w-3 h-3" />
                        {estado.label}
                      </span>
                    </div>
                  </div>

                  {/* ITEMS DEL PEDIDO */}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-3">
                      {pedido.items?.length || 0} producto{(pedido.items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-2">
                      {(pedido.items || []).map((item, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-3 p-2 bg-dark-700/50 rounded-lg"
                        >
                          <div className="w-12 h-12 bg-dark-700 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {item.imagen ? (
                              <img
                                src={item.imagen}
                                alt={item.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-neon-cyan/40 font-display text-xs">TP</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-body truncate">
                              {item.nombre || 'Producto'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              x{item.cantidad} × ${Number(item.precio || 0).toFixed(2)}
                            </p>
                          </div>
                          <span className="text-neon-green font-display text-sm font-bold">
                            ${(Number(item.precio || 0) * Number(item.cantidad || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end mt-4 gap-3 flex-wrap">
                      <Link
                        to="/seguimiento"
                        className="inline-flex items-center gap-1 text-xs text-neon-cyan hover:text-neon-pink transition font-display uppercase tracking-wider"
                      >
                        Ver seguimiento
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        {pedidos.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              to="/tienda"
              className="inline-flex items-center gap-2 px-6 py-3 border border-neon-cyan text-neon-cyan font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-cyan hover:text-black transition"
            >
              <Sparkles className="w-4 h-4" />
              Seguir comprando
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPedidos;