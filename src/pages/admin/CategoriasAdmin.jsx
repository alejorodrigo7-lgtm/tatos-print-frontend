import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit, Trash2, X, Loader2, AlertCircle, FolderTree, Save, Search,
} from 'lucide-react';
import { categoriasAPI } from '../../services/api';

const FORM_VACIO = {
  nombre: '',
  descripcion: '',
  imagen: '',
};

const CategoriasAdmin = () => {
  const [categorias, setCategorias] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await categoriasAPI.listar();
      setCategorias(res.data.categorias || res.data || []);
    } catch (err) {
      console.error(err);
      setError('No pudimos cargar las categorías');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setError('');
    setModalAbierto(true);
  };

  const abrirEditar = (c) => {
    setEditando(c._id);
    setForm({
      nombre: c.nombre || '',
      descripcion: c.descripcion || '',
      imagen: c.imagen || '',
    });
    setError('');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_VACIO);
    setError('');
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        imagen: form.imagen.trim() || undefined,
      };

      if (editando) {
        await categoriasAPI.actualizar(editando, payload);
      } else {
        await categoriasAPI.crear(payload);
      }
      await cargar();
      cerrarModal();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No pudimos guardar la categoría'
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return;
    try {
      await categoriasAPI.eliminar(id);
      await cargar();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  const filtradas = categorias.filter((c) =>
    c.nombre?.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">

      {/* ENCABEZADO */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white">
            GESTIÓN DE <span className="text-neon-purple text-glow-pink">CATEGORÍAS</span>
          </h1>
          <p className="text-gray-400 mt-2 font-body text-sm">
            {categorias.length} categoría{categorias.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 px-5 py-3 bg-neon-purple text-white font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink transition shadow-neon-pink"
        >
          <Plus className="w-4 h-4" />
          Nueva categoría
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-purple pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-neon-purple/30 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-purple transition"
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
          <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-20 bg-dark-800 border border-neon-purple/20 rounded-xl">
          <FolderTree className="w-16 h-16 text-neon-purple/40 mx-auto mb-4" />
          <p className="text-gray-400 font-body">
            {buscar ? 'Sin resultados' : 'No hay categorías todavía'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-dark-800 border border-neon-purple/20 rounded-xl p-5 hover:border-neon-purple/60 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-neon-purple/10 border border-neon-purple/40 rounded-lg flex items-center justify-center">
                  <FolderTree className="w-6 h-6 text-neon-purple" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => abrirEditar(c)}
                    className="p-2 text-neon-cyan hover:bg-neon-cyan/10 rounded transition"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEliminar(c._id, c.nombre)}
                    className="p-2 text-neon-pink hover:bg-neon-pink/10 rounded transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-white mb-2">
                {c.nombre}
              </h3>
              {c.descripcion && (
                <p className="text-gray-400 text-sm font-body line-clamp-2">
                  {c.descripcion}
                </p>
              )}
              {c.slug && (
                <p className="text-xs text-neon-purple/70 font-mono mt-3">
                  /{c.slug}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg my-8 bg-dark-800 border border-neon-purple/40 rounded-2xl shadow-neon-pink"
          >
            <div className="flex items-center justify-between p-5 border-b border-neon-purple/20">
              <h2 className="font-display text-xl font-bold text-white uppercase tracking-wider">
                {editando ? 'Editar categoría' : 'Nueva categoría'}
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
                <label className="block text-xs uppercase tracking-wider text-neon-purple mb-2 font-display">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  placeholder="Ej: Anime"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neon-purple mb-2 font-display">
                  Descripción
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Breve descripción de la categoría"
                  className="input-base resize-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neon-purple mb-2 font-display">
                  URL de imagen (opcional)
                </label>
                <input
                  type="url"
                  value={form.imagen}
                  onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                  placeholder="https://..."
                  className="input-base"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-neon-pink/10 border border-neon-pink/40 rounded">
                  <AlertCircle className="w-4 h-4 text-neon-pink flex-shrink-0 mt-0.5" />
                  <p className="text-neon-pink text-sm font-body">{error}</p>
                </div>
              )}
            </form>

            <div className="flex justify-end gap-3 p-5 border-t border-neon-purple/20">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neon-purple text-white font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink transition disabled:opacity-50"
              >
                {enviando ? (
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
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CategoriasAdmin;