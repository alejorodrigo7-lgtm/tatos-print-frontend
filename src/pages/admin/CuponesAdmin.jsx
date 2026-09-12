import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, X, Loader2, AlertCircle, Ticket, Percent, DollarSign,
  Calendar, Copy, Check,
} from 'lucide-react';
import { cuponesAPI } from '../../services/api';

const FORM_VACIO = {
  codigo: '',
  descuento: '',
  tipo: 'porcentaje', // 'porcentaje' o 'fijo'
  montoMinimo: '',
  usosMaximos: '',
  fechaExpiracion: '',
  activo: true,
};

const CuponesAdmin = () => {
  const [cupones, setCupones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [copiado, setCopiado] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await cuponesAPI.listar();
      setCupones(res.data.cupones || res.data || []);
    } catch (err) {
      console.error(err);
      setError('No pudimos cargar los cupones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setError('');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setForm(FORM_VACIO);
    setError('');
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const payload = {
        codigo: form.codigo.trim().toUpperCase(),
        descuento: Number(form.descuento),
        tipo: form.tipo,
        montoMinimo: form.montoMinimo ? Number(form.montoMinimo) : 0,
        usosMaximos: form.usosMaximos ? Number(form.usosMaximos) : null,
        fechaExpiracion: form.fechaExpiracion || null,
        activo: form.activo,
      };

      await cuponesAPI.crear(payload);
      await cargar();
      cerrarModal();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No pudimos crear el cupón'
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id, codigo) => {
    if (!confirm(`¿Eliminar el cupón "${codigo}"?`)) return;
    try {
      await cuponesAPI.eliminar(id);
      await cargar();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
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

  return (
    <div className="max-w-5xl mx-auto">

      {/* ENCABEZADO */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white">
            GESTIÓN DE <span className="text-neon-yellow text-glow-cyan">CUPONES</span>
          </h1>
          <p className="text-gray-400 mt-2 font-body text-sm">
            {cupones.length} cupón{cupones.length !== 1 ? 'es' : ''} registrado{cupones.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 px-5 py-3 bg-neon-yellow text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition shadow-neon-cyan"
        >
          <Plus className="w-4 h-4" />
          Nuevo cupón
        </button>
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
          <Loader2 className="w-8 h-8 text-neon-yellow animate-spin" />
        </div>
      ) : cupones.length === 0 ? (
        <div className="text-center py-20 bg-dark-800 border border-neon-yellow/20 rounded-xl">
          <Ticket className="w-16 h-16 text-neon-yellow/40 mx-auto mb-4" />
          <p className="text-gray-400 font-body">No hay cupones todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cupones.map((c, i) => {
            const activo = c.activo !== false;
            const expirado = c.fechaExpiracion && new Date(c.fechaExpiracion) < new Date();
            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative bg-dark-800 border rounded-xl p-5 transition ${
                  !activo || expirado
                    ? 'border-gray-700 opacity-60'
                    : 'border-neon-yellow/40 hover:border-neon-yellow'
                }`}
              >
                {/* Badge de estado */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`text-[10px] px-2 py-1 rounded font-display uppercase tracking-wider ${
                      !activo
                        ? 'bg-gray-700 text-gray-400'
                        : expirado
                        ? 'bg-neon-pink/20 text-neon-pink'
                        : 'bg-neon-green/20 text-neon-green'
                    }`}
                  >
                    {!activo ? 'Inactivo' : expirado ? 'Expirado' : 'Activo'}
                  </span>
                </div>

                {/* Código */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-neon-yellow/10 border border-neon-yellow/40 rounded-lg flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-neon-yellow" />
                  </div>
                  <div>
                    <button
                      onClick={() => copiarCodigo(c.codigo)}
                      className="font-display text-xl font-black text-neon-yellow hover:text-neon-pink transition flex items-center gap-2"
                    >
                      {c.codigo}
                      {copiado === c.codigo ? (
                        <Check className="w-4 h-4 text-neon-green" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-50" />
                      )}
                    </button>
                    <p className="text-xs text-gray-500 font-body">
                      {c.tipo === 'fijo' ? 'Descuento fijo' : 'Porcentaje'}
                    </p>
                  </div>
                </div>

                {/* Descuento */}
                <div className="flex items-baseline gap-1 mb-4">
                  {c.tipo === 'fijo' ? (
                    <DollarSign className="w-5 h-5 text-neon-green" />
                  ) : (
                    <Percent className="w-5 h-5 text-neon-green" />
                  )}
                  <span className="font-display text-3xl font-black text-neon-green">
                    {c.descuento ?? c.valor ?? 0}
                  </span>
                  <span className="text-gray-400 text-sm font-body">
                    {c.tipo === 'fijo' ? 'de descuento' : '% off'}
                  </span>
                </div>

                {/* Detalles */}
                <div className="space-y-1 text-xs text-gray-400 font-body mb-4">
                  {c.montoMinimo > 0 && (
                    <p>Monto mínimo: ${Number(c.montoMinimo).toFixed(2)}</p>
                  )}
                  {c.fechaExpiracion && (
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expira: {formatearFecha(c.fechaExpiracion)}
                    </p>
                  )}
                  {c.usosMaximos && (
                    <p>
                      Usos: {c.usosActuales || 0}/{c.usosMaximos}
                    </p>
                  )}
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => handleEliminar(c._id, c.codigo)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-neon-pink/40 text-neon-pink text-xs font-display uppercase tracking-wider rounded hover:bg-neon-pink hover:text-white transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Eliminar
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg my-8 bg-dark-800 border border-neon-yellow/40 rounded-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-neon-yellow/20">
              <h2 className="font-display text-xl font-bold text-white uppercase tracking-wider">
                Nuevo cupón
              </h2>
              <button
                onClick={cerrarModal}
                className="p-2 text-gray-400 hover:text-neon-pink transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-4">

              <div>
                <label className="block text-xs uppercase tracking-wider text-neon-yellow mb-2 font-display">
                  Código *
                </label>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                  required
                  placeholder="TATOS10"
                  className="input-base font-display tracking-widest uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neon-yellow mb-2 font-display">
                    Tipo *
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="input-base"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Monto fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neon-yellow mb-2 font-display">
                    Descuento *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={form.tipo === 'porcentaje' ? '1' : '0.01'}
                    value={form.descuento}
                    onChange={(e) => setForm({ ...form, descuento: e.target.value })}
                    required
                    placeholder={form.tipo === 'porcentaje' ? '10' : '5.00'}
                    className="input-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neon-yellow mb-2 font-display">
                    Monto mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.montoMinimo}
                    onChange={(e) => setForm({ ...form, montoMinimo: e.target.value })}
                    placeholder="0.00"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neon-yellow mb-2 font-display">
                    Usos máximos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.usosMaximos}
                    onChange={(e) => setForm({ ...form, usosMaximos: e.target.value })}
                    placeholder="Sin límite"
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neon-yellow mb-2 font-display">
                  Fecha de expiración
                </label>
                <input
                  type="date"
                  value={form.fechaExpiracion}
                  onChange={(e) => setForm({ ...form, fechaExpiracion: e.target.value })}
                  className="input-base"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-5 h-5 accent-neon-yellow"
                />
                <span className="text-white font-body text-sm">Cupón activo</span>
              </label>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-neon-pink/10 border border-neon-pink/40 rounded">
                  <AlertCircle className="w-4 h-4 text-neon-pink flex-shrink-0 mt-0.5" />
                  <p className="text-neon-pink text-sm font-body">{error}</p>
                </div>
              )}
            </form>

            <div className="flex justify-end gap-3 p-5 border-t border-neon-yellow/20">
              <button
                type="button"
                onClick={cerrarModal}
                className="px-5 py-2.5 border border-gray-600 text-gray-300 font-display uppercase tracking-wider text-sm rounded hover:border-neon-pink hover:text-neon-pink transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardar}
                disabled={enviando}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neon-yellow text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition disabled:opacity-50"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Crear cupón
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CuponesAdmin;