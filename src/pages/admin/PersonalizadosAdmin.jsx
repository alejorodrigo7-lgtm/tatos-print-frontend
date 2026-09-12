import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette, Search, Loader2, X, Mail, MessageCircle, Trash2, Save,
  DollarSign, Edit, Image as ImageIcon,
} from 'lucide-react';
import { personalizadosAPI } from '../../services/api';

const ESTADOS = [
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'cotizado', label: 'Cotizado', color: 'cyan' },
  { value: 'aprobado', label: 'Aprobado', color: 'green' },
  { value: 'en_produccion', label: 'En producción', color: 'purple' },
  { value: 'enviado', label: 'Enviado', color: 'cyan' },
  { value: 'cancelado', label: 'Cancelado', color: 'pink' },
];

const COLORES = {
  pendiente: 'yellow',
  cotizado: 'cyan',
  aprobado: 'green',
  en_produccion: 'purple',
  enviado: 'cyan',
  cancelado: 'pink',
};

const PersonalizadosAdmin = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({ estado: '', presupuesto: '', notasAdmin: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await personalizadosAPI.listar();
      const lista = res.data.personalizados || res.data.solicitudes || res.data || [];
      setSolicitudes(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.error('Error personalizados:', err);
      setError('No pudimos cargar las solicitudes');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirDetalle = (s) => {
    setDetalle(s);
    setEditForm({
      estado: s.estado || 'pendiente',
      presupuesto: s.presupuesto || '',
      notasAdmin: s.notasAdmin || '',
    });
    setEditando(false);
  };

  const cerrarDetalle = () => {
    setDetalle(null);
    setEditando(false);
  };

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      const payload = {
        estado: editForm.estado,
        presupuesto: editForm.presupuesto ? Number(editForm.presupuesto) : undefined,
        notasAdmin: editForm.notasAdmin,
      };
      const res = await personalizadosAPI.actualizar(detalle._id, payload);
      const actualizada = res.data.personalizado || res.data.solicitud || res.data;
      setSolicitudes((ss) =>
        ss.map((s) => (s._id === detalle._id ? { ...s, ...actualizada } : s))
      );
      setDetalle((d) => ({ ...d, ...actualizada }));
      setEditando(false);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.mensaje || err.message));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar la solicitud de "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await personalizadosAPI.eliminar(id);
      setSolicitudes((ss) => ss.filter((s) => s._id !== id));
      if (detalle?._id === id) cerrarDetalle();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  const abrirWhatsApp = (s) => {
    const mensaje = encodeURIComponent(
      `Hola ${s.nombre.split(' ')[0]}, te escribimos de Tatos Print por tu solicitud personalizada de "${s.descripcion.slice(0, 50)}..." 🎨`
    );
    const tel = (s.telefono || '').replace(/\D/g, '').slice(-9);
    window.open(`https://wa.me/593${tel}?text=${mensaje}`, '_blank');
  };

  const abrirEmail = (s) => {
    const asunto = encodeURIComponent('Tatos Print - Tu pedido personalizado');
    const cuerpo = encodeURIComponent(
      `Hola ${s.nombre.split(' ')[0]},\n\nRecibimos tu solicitud para "${s.descripcion.slice(0, 80)}...".\n\n¿Podemos coordinar los detalles?\n\nSaludos,\nTatos Print`
    );
    window.location.href = `mailto:${s.email}?subject=${asunto}&body=${cuerpo}`;
  };

  const formatearFecha = (f) => {
    if (!f) return '—';
    try {
      return new Date(f).toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const filtradas = solicitudes.filter((s) => {
    const coincideBuscar =
      !buscar ||
      s.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
      s.email?.toLowerCase().includes(buscar.toLowerCase()) ||
      s.descripcion?.toLowerCase().includes(buscar.toLowerCase());
    const coincideEstado = !filtroEstado || s.estado === filtroEstado;
    return coincideBuscar && coincideEstado;
  });

  const contadores = ESTADOS.reduce((acc, e) => {
    acc[e.value] = solicitudes.filter((s) => s.estado === e.value).length;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto">

      {/* ENCABEZADO */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-black text-white">
          PEDIDOS <span className="text-neon-pink text-glow-pink">PERSONALIZADOS</span>
        </h1>
        <p className="text-gray-400 mt-2 font-body text-sm">
          {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} recibida{solicitudes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* CONTADORES */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ESTADOS.map((e) => (
          <button
            key={e.value}
            onClick={() => setFiltroEstado(filtroEstado === e.value ? '' : e.value)}
            className={`px-3 py-1.5 text-xs font-display uppercase tracking-wider rounded border transition ${
              filtroEstado === e.value
                ? `bg-neon-${e.color}/20 border-neon-${e.color} text-neon-${e.color} font-bold`
                : 'border-gray-700 text-gray-400 hover:border-neon-cyan'
            }`}
          >
            {e.label}: {contadores[e.value] || 0}
          </button>
        ))}
      </div>

      {/* BUSCADOR */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-pink pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o descripción..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-neon-pink/30 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-pink transition"
        />
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
          <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-20 bg-dark-800 border border-neon-pink/20 rounded-xl">
          <Palette className="w-16 h-16 text-neon-pink/40 mx-auto mb-4" />
          <p className="text-gray-400 font-body">
            {buscar || filtroEstado ? 'Sin resultados' : 'No hay solicitudes todavía'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtradas.map((s, i) => {
            const color = COLORES[s.estado] || 'yellow';
            return (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-dark-800 border border-neon-pink/20 rounded-xl overflow-hidden hover:border-neon-pink/60 transition flex flex-col"
              >
                <div className="flex items-start gap-3 p-5 border-b border-neon-pink/10">
                  {s.imagenReferencia ? (
                    <img
                      src={s.imagenReferencia}
                      alt="Referencia"
                      className="w-16 h-16 rounded-lg object-cover border border-neon-pink/30 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-neon-pink/10 border border-neon-pink/30 flex-shrink-0 flex items-center justify-center">
                      <ImageIcon className="w-7 h-7 text-neon-pink/60" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-white truncate">
                      {s.nombre}
                    </p>
                    <p className="text-xs text-gray-500 font-body truncate">
                      {s.email}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest bg-neon-${color}/10 border border-neon-${color}/40 text-neon-${color} rounded`}
                    >
                      {ESTADOS.find((e) => e.value === s.estado)?.label || s.estado}
                    </span>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => abrirWhatsApp(s)}
                      className="p-2 text-neon-green hover:bg-neon-green/10 rounded transition"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => abrirEmail(s)}
                      className="p-2 text-neon-cyan hover:bg-neon-cyan/10 rounded transition"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-5">
                  <p className="text-gray-400 text-sm font-body line-clamp-3">
                    {s.descripcion}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-body">
                    {s.tamaño && <span>📏 {s.tamaño}</span>}
                    <span>📅 {formatearFecha(s.createdAt)}</span>
                  </div>
                  {s.presupuesto && (
                    <p className="mt-3 font-display text-lg font-black text-neon-green">
                      ${Number(s.presupuesto).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="flex border-t border-neon-pink/10">
                  <button
                    onClick={() => abrirDetalle(s)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-display uppercase tracking-wider text-neon-cyan hover:bg-neon-cyan/10 transition"
                  >
                    <Edit className="w-3 h-3" />
                    Ver / Editar
                  </button>
                  <button
                    onClick={() => eliminar(s._id, s.nombre)}
                    className="px-4 py-3 text-neon-pink hover:bg-neon-pink/10 transition border-l border-neon-pink/10"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL DETALLE */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl my-8 bg-dark-800 border border-neon-pink/40 rounded-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-neon-pink/20">
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Solicitud personalizada
                </h2>
                <p className="text-xs text-gray-500 font-body mt-1">
                  {formatearFecha(detalle.createdAt)}
                </p>
              </div>
              <button
                onClick={cerrarDetalle}
                className="p-2 text-gray-400 hover:text-neon-pink transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

              <div>
                <p className="text-xs uppercase tracking-widest text-neon-cyan font-display mb-2">
                  Cliente
                </p>
                <p className="text-white font-body">{detalle.nombre}</p>
                <p className="text-gray-400 text-sm font-body">{detalle.email}</p>
                {detalle.telefono && (
                  <p className="text-gray-400 text-sm font-body">📞 {detalle.telefono}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => abrirWhatsApp(detalle)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neon-green/20 border border-neon-green text-neon-green text-xs font-display uppercase tracking-wider rounded hover:bg-neon-green hover:text-black transition"
                  >
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </button>
                  <button
                    onClick={() => abrirEmail(detalle)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan text-xs font-display uppercase tracking-wider rounded hover:bg-neon-cyan hover:text-black transition"
                  >
                    <Mail className="w-3 h-3" /> Email
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-neon-cyan font-display mb-2">
                  Descripción
                </p>
                <p className="text-gray-300 font-body text-sm whitespace-pre-wrap">
                  {detalle.descripcion}
                </p>
                {detalle.tamaño && (
                  <p className="text-gray-500 text-xs font-body mt-2">
                    📏 Tamaño: {detalle.tamaño}
                  </p>
                )}
              </div>

              {detalle.imagenReferencia && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-neon-cyan font-display mb-2">
                    <ImageIcon className="w-3 h-3 inline mr-1" /> Imagen de referencia
                  </p>
                  <a
                    href={detalle.imagenReferencia}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={detalle.imagenReferencia}
                      alt="Referencia"
                      className="rounded-lg border border-neon-pink/30 max-h-64 object-contain hover:opacity-80 transition"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </a>
                </div>
              )}

              {!editando ? (
                <div className="pt-4 border-t border-neon-pink/20 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-1">
                        Estado
                      </p>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-display uppercase tracking-widest bg-neon-${COLORES[detalle.estado] || 'yellow'}/10 border border-neon-${COLORES[detalle.estado] || 'yellow'}/40 text-neon-${COLORES[detalle.estado] || 'yellow'} rounded`}
                      >
                        {ESTADOS.find((e) => e.value === detalle.estado)?.label || detalle.estado}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-1">
                        Presupuesto
                      </p>
                      <p className="font-display text-lg font-bold text-neon-green">
                        {detalle.presupuesto
                          ? `$${Number(detalle.presupuesto).toFixed(2)}`
                          : '— sin asignar'}
                      </p>
                    </div>
                  </div>

                  {detalle.notasAdmin && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-1">
                        Notas internas
                      </p>
                      <p className="text-gray-400 text-sm font-body whitespace-pre-wrap">
                        {detalle.notasAdmin}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setEditando(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-neon-cyan text-neon-cyan font-display uppercase tracking-wider text-sm rounded hover:bg-neon-cyan hover:text-black transition"
                  >
                    <Edit className="w-4 h-4" /> Editar estado, presupuesto y notas
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-neon-pink/20 space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
                      Estado
                    </label>
                    <select
                      value={editForm.estado}
                      onChange={(e) => setEditForm({ ...editForm, estado: e.target.value })}
                      className="input-base"
                    >
                      {ESTADOS.map((e) => (
                        <option key={e.value} value={e.value}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
                      <DollarSign className="w-3 h-3 inline mr-1" /> Presupuesto
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.presupuesto}
                      onChange={(e) => setEditForm({ ...editForm, presupuesto: e.target.value })}
                      placeholder="0.00"
                      className="input-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
                      Notas internas (solo admin)
                    </label>
                    <textarea
                      value={editForm.notasAdmin}
                      onChange={(e) => setEditForm({ ...editForm, notasAdmin: e.target.value })}
                      rows={3}
                      placeholder="Ej: cliente pidió cambio de color, ya pagó adelanto..."
                      className="input-base resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditando(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-600 text-gray-300 font-display uppercase tracking-wider text-sm rounded hover:border-neon-pink hover:text-neon-pink transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarCambios}
                      disabled={guardando}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition disabled:opacity-50"
                    >
                      {guardando ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Guardar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PersonalizadosAdmin;