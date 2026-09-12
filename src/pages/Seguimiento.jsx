import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Package, Truck, CheckCircle, Clock, XCircle, AlertCircle,
  Calendar, MapPin, DollarSign, Loader2, Sparkles,
} from 'lucide-react';
import { pedidosAPI } from '../services/api';

const ESTADOS = {
  pendiente: { color: 'yellow', icon: Clock, label: 'Pendiente' },
  en_preparacion: { color: 'purple', icon: Package, label: 'En preparación' },
  impreso: { color: 'cyan', icon: Package, label: 'Impreso' },
  enviado: { color: 'cyan', icon: Truck, label: 'Enviado' },
  entregado: { color: 'green', icon: CheckCircle, label: 'Entregado' },
  cancelado: { color: 'pink', icon: XCircle, label: 'Cancelado' },
};

const Seguimiento = () => {
  const [codigo, setCodigo] = useState('');
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleBuscar = async (e) => {
    e.preventDefault();
    // Normalizar: quitar #, asegurar formato TP-XXXX, agregar # final
    let limpio = codigo.trim().toUpperCase().replace(/^#/, '');
    if (!limpio.startsWith('TP-')) limpio = 'TP-' + limpio;
    limpio = '#' + limpio;
    if (!limpio) return;

    setCargando(true);
    setError('');
    setPedido(null);

    try {
      const res = await pedidosAPI.seguimiento(limpio);
      const data = res.data.pedido || res.data;
      if (!data || !data.codigoPedido) {
        setError('No encontramos ningún pedido con ese código');
      } else {
        setPedido(data);
      }
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No encontramos ningún pedido con ese código'
      );
    } finally {
      setCargando(false);
    }
  };

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

  const estado = pedido ? ESTADOS[pedido.estado] || ESTADOS.pendiente : null;

  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ENCABEZADO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Sparkles className="w-12 h-12 text-neon-pink mx-auto mb-4 animate-pulse" />
          <h1 className="font-display text-4xl md:text-6xl font-black text-white">
            SEGUIR <span className="text-neon-cyan text-glow-cyan">PEDIDO</span>
          </h1>
          <p className="text-gray-400 mt-3 font-body">
            Ingresa tu código de seguimiento para ver el estado de tu pedido
          </p>
        </motion.div>

        {/* BUSCADOR */}
        <motion.form
          onSubmit={handleBuscar}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan pointer-events-none" />
              <input
                type="text"
                placeholder="#TP-0001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                className="w-full pl-12 pr-4 py-4 bg-dark-800 border border-neon-cyan/30 rounded-lg text-white placeholder-gray-500 font-display tracking-widest focus:outline-none focus:border-neon-cyan focus:shadow-neon-cyan transition text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={cargando || !codigo.trim()}
              className="px-8 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition shadow-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </button>
          </div>
        </motion.form>

        {/* ERROR */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-neon-pink/10 border border-neon-pink/40 rounded-lg mb-6"
          >
            <AlertCircle className="w-5 h-5 text-neon-pink flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-neon-pink text-sm font-body font-bold">Sin resultados</p>
              <p className="text-neon-pink/70 text-xs font-body mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* RESULTADO */}
        {pedido && estado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >

            {/* Estado grande */}
            <div className="bg-dark-800 border border-neon-cyan/30 rounded-2xl p-6 text-center">
              <div
                className={`w-20 h-20 mx-auto mb-4 rounded-full bg-neon-${estado.color}/10 border-2 border-neon-${estado.color} flex items-center justify-center shadow-neon-${estado.color}`}
              >
                <estado.icon className={`w-10 h-10 text-neon-${estado.color}`} />
              </div>
              <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-2">
                Estado actual
              </p>
              <h2 className={`font-display text-2xl font-black text-neon-${estado.color} text-glow-${estado.color}`}>
                {estado.label.toUpperCase()}
              </h2>
            </div>

            {/* Info del pedido */}
            <div className="bg-dark-800 border border-neon-cyan/30 rounded-2xl p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-1">
                    código
                  </p>
                  <p className="font-display text-xl font-black text-neon-yellow">
                    {pedido.codigoPedido}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Fecha
                  </p>
                  <p className="text-white font-body text-sm">
                    {formatearFecha(pedido.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-1">
                    <DollarSign className="w-3 h-3 inline mr-1" />
                    Total
                  </p>
                  <p className="font-display text-xl font-black text-neon-green">
                    ${Number(pedido.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Dirección */}
              {pedido.direccionEnvio && (
                <div className="pt-4 border-t border-neon-cyan/10">
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Dirección de envío
                  </p>
                  <p className="text-gray-300 font-body text-sm">
                    {pedido.direccionEnvio.calle} Â· {pedido.direccionEnvio.ciudad} Â·{' '}
                    {pedido.direccionEnvio.pais}
                  </p>
                </div>
              )}
            </div>

            {/* Productos */}
            <div className="bg-dark-800 border border-neon-cyan/30 rounded-2xl p-6">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-4">
                Productos ({pedido.productos?.length || 0})
              </p>
              <div className="space-y-3">
                {(pedido.productos || []).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg"
                  >
                    <div className="w-14 h-14 bg-dark-700 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
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
                      <p className="text-white text-sm font-body truncate">{item.nombre}</p>
                      <p className="text-gray-500 text-xs">
                        x{item.cantidad} Á— ${Number(item.precio || 0).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-neon-green font-display text-sm font-bold">
                      ${(Number(item.precio || 0) * Number(item.cantidad || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* Hint */}
        {!pedido && !error && (
          <div className="mt-10 p-4 bg-dark-800 border border-neon-yellow/30 rounded-lg text-center">
            <p className="text-xs text-neon-yellow font-body">
              ðŸ’¡ Tu código aparece en la pantalla de confirmación y en tus pedidos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Seguimiento;