import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Search, Loader2, Filter, Calendar, DollarSign, User,
  MapPin, Package, X, ChevronDown,
} from 'lucide-react';
import { pedidosAPI } from '../../services/api';

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'en_preparacion', label: 'En preparación', color: 'purple' },
  { value: 'impreso', label: 'Impreso', color: 'cyan' },
  { value: 'enviado', label: 'Enviado', color: 'cyan' },
  { value: 'entregado', label: 'Entregado', color: 'green' },
  { value: 'cancelado', label: 'Cancelado', color: 'pink' },
];

const COLORES = {
  pendiente: 'yellow',
  en_preparacion: 'purple',
  impreso: 'cyan',
  enviado: 'cyan',
  entregado: 'green',
  cancelado: 'pink',
};

const PedidosAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [detalleAbierto, setDetalleAbierto] = useState(null);
  const [actualizando, setActualizando] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await pedidosAPI.listar();
      setPedidos(res.data.pedidos || res.data || []);
    } catch (err) {
      console.error('Error pedidos:', err);
      setError('No pudimos cargar los pedidos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    setActualizando(id);
    try {
      await pedidosAPI.actualizarEstado(id, nuevoEstado);
      setPedidos((ps) =>
        ps.map((p) => (p._id === id ? { ...p, estado: nuevoEstado } : p))
      );
      if (detalleAbierto?._id === id) {
        setDetalleAbierto((d) => ({ ...d, estado: nuevoEstado }));
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.mensaje || err.message));
    } finally {
      setActualizando(null);
    }
  };

  const filtrados = pedidos.filter((p) => {
    const coincideBuscar =
      !buscar ||
      p.codigoPedido?.toLowerCase().includes(buscar.toLowerCase()) ||
      p.cliente?.nombre?.toLowerCase().includes(buscar.toLowerCase());
    const coincideEstado = !filtroEstado || p.estado === filtroEstado;
    return coincideBuscar && coincideEstado;
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    try {
      return new Date(fecha).toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* ENCABEZADO */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-black text-white">
          GESTIÓN DE <span className="text-neon-cyan text-glow-cyan">PEDIDOS</span>
        </h1>
        <p className="text-gray-400 mt-2 font-body text-sm">
          {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} registrados
        </p>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por código o cliente..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-neon-cyan/30 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-cyan transition"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan pointer-events-none" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-neon-cyan/30 rounded-lg text-white font-body focus:outline-none focus:border-neon-cyan transition appearance-none"
          >
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 bg-neon-pink/10 border border-neon-pink/40 rounded-lg mb-6 text-neon-pink font-body text-sm">
          {error}
        </div>
      )}

      {/* LISTA */}
      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 bg-dark-800 border border-neon-cyan/20 rounded-xl">
          <ShoppingBag className="w-16 h-16 text-neon-cyan/40 mx-auto mb-4" />
          <p className="text-gray-400 font-body">
            {buscar || filtroEstado ? 'Sin resultados' : 'No hay pedidos todavía'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((p, i) => {
            const color = COLORES[p.estado] || 'cyan';
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-dark-800 border border-neon-cyan/20 rounded-xl overflow-hidden hover:border-neon-cyan/50 transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-center">

                  {/* Código */}
                  <div className="md:col-span-3">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-display">
                      Código
                    </p>
                    <p className="font-display text-lg font-black text-neon-yellow">
                      {p.codigoPedido || `#${p._id?.slice(-6)}`}
                    </p>
                  </div>

                  {/* Cliente */}
                  <div className="md:col-span-3">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-display">
                      Cliente
                    </p>
                    <p className="text-white font-body text-sm truncate">
                      {p.cliente?.nombre || '—'}
                    </p>
                    <p className="text-xs text-gray-500 font-body truncate">
                      {p.cliente?.email || ''}
                    </p>
                  </div>

                  {/* Fecha */}
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-display">
                      Fecha
                    </p>
                    <p className="text-gray-300 text-sm font-body flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatearFecha(p.createdAt)}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-display">
                      Total
                    </p>
                    <p className="font-display font-bold text-neon-green">
                      ${Number(p.total || 0).toFixed(2)}
                    </p>
                  </div>

                  {/* Selector de estado */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <select
                        value={p.estado}
                        onChange={(e) => cambiarEstado(p._id, e.target.value)}
                        disabled={actualizando === p._id}
                        className={`w-full px-3 py-2 bg-dark-700 border border-neon-${color}/40 text-neon-${color} font-display text-xs uppercase tracking-wider rounded cursor-pointer focus:outline-none focus:border-neon-${color} disabled:opacity-50`}
                      >
                        {ESTADOS.filter((e) => e.value).map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                      {actualizando === p._id && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-cyan animate-spin" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Botón ver detalle */}
                <button
                  onClick={() => setDetalleAbierto(p)}
                  className="w-full text-left px-5 py-3 border-t border-neon-cyan/10 text-xs text-neon-cyan hover:text-neon-pink hover:bg-dark-700/40 transition font-display uppercase tracking-wider flex items-center justify-between"
                >
                  Ver detalle
                  <ChevronDown className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══════════ MODAL DETALLE ═══════════ */}
      {detalleAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl my-8 bg-dark-800 border border-neon-cyan/40 rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neon-cyan/20">
              <div>
                <h2 className="font-display text-xl font-bold text-neon-yellow">
                  {detalleAbierto.codigoPedido || `#${detalleAbierto._id?.slice(-6)}`}
                </h2>
                <p className="text-xs text-gray-500 font-body mt-1">
                  {formatearFecha(detalleAbierto.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setDetalleAbierto(null)}
                className="p-2 text-gray-400 hover:text-neon-pink transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Cliente */}
              {detalleAbierto.cliente && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-neon-cyan font-display mb-2 flex items-center gap-1">
                    <User className="w-3 h-3" /> Cliente
                  </p>
                  <p className="text-white font-body">
                    {detalleAbierto.cliente.nombre || '—'}
                  </p>
                  <p className="text-gray-400 font-body text-sm">
                    {detalleAbierto.cliente.email} · {detalleAbierto.cliente.telefono}
                  </p>
                </div>
              )}

              {/* Dirección */}
              {detalleAbierto.direccionEnvio && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-neon-cyan font-display mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Envío
                  </p>
                  <p className="text-gray-300 font-body text-sm">
                    {detalleAbierto.direccionEnvio.calle} ·{' '}
                    {detalleAbierto.direccionEnvio.ciudad} ·{' '}
                    {detalleAbierto.direccionEnvio.pais}
                  </p>
                </div>
              )}

              {/* Productos */}
              <div>
                <p className="text-xs uppercase tracking-widest text-neon-cyan font-display mb-3 flex items-center gap-1">
                  <Package className="w-3 h-3" /> Productos
                </p>
                <div className="space-y-2">
                  {(detalleAbierto.productos || []).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-dark-700 rounded overflow-hidden flex-shrink-0">
                        {item.imagen ? (
                          <img
                            src={item.imagen}
                            alt={item.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neon-cyan/40 text-xs font-display">
                            TP
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-body truncate">{item.nombre}</p>
                        <p className="text-gray-500 text-xs">
                          x{item.cantidad} × ${Number(item.precio || 0).toFixed(2)}
                        </p>
                      </div>
                      <span className="text-neon-green font-display font-bold text-sm">
                        ${(Number(item.precio || 0) * Number(item.cantidad || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="pt-4 border-t border-neon-cyan/20 space-y-2">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">${Number(detalleAbierto.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-gray-400">Envío</span>
                  <span className="text-white">${Number(detalleAbierto.envio || 0).toFixed(2)}</span>
                </div>
                {detalleAbierto.descuento > 0 && (
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-gray-400">Descuento</span>
                    <span className="text-neon-green">
                      -${Number(detalleAbierto.descuento).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2 border-t border-neon-cyan/20">
                  <span className="font-display uppercase tracking-wider text-white">Total</span>
                  <span className="font-display text-2xl font-black text-neon-green text-glow-green">
                    ${Number(detalleAbierto.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Método de pago y notas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neon-cyan/20">
                <div>
                  <p className="text-xs uppercase tracking-widest text-neon-cyan font-display mb-1">
                    <DollarSign className="w-3 h-3 inline mr-1" /> Pago
                  </p>
                  <p className="text-white text-sm font-body">
                    {detalleAbierto.metodoPago || '—'}
                  </p>
                </div>
                {detalleAbierto.notas && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neon-cyan font-display mb-1">
                      Notas
                    </p>
                    <p className="text-gray-300 text-sm font-body">{detalleAbierto.notas}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer con cambio de estado */}
            <div className="p-5 border-t border-neon-cyan/20">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-2">
                Cambiar estado
              </p>
              <div className="flex flex-wrap gap-2">
                {ESTADOS.filter((e) => e.value).map((e) => (
                  <button
                    key={e.value}
                    onClick={() => cambiarEstado(detalleAbierto._id, e.value)}
                    disabled={actualizando === detalleAbierto._id}
                    className={`px-3 py-2 rounded text-xs font-display uppercase tracking-wider border transition ${
                      detalleAbierto.estado === e.value
                        ? `bg-neon-${e.color}/20 border-neon-${e.color} text-neon-${e.color} font-bold`
                        : 'border-gray-600 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan'
                    } disabled:opacity-50`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PedidosAdmin;