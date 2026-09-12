import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, X, Loader2, AlertCircle, Upload, Check,
  Package, Save, Image as ImageIcon,
} from 'lucide-react';
import { productosAPI, categoriasAPI, uploadAPI } from '../../services/api';

const FORM_VACIO = {
  nombre: '',
  descripcion: '',
  descripcionLarga: '',
  precio: '',
  precioOferta: '',
  stock: 0,
  categoria: '',
  tipo: 'Figuras',
  tamaño: '12cm',
  imagenes: [],
  etiquetas: [],
  activo: true,
};

const TIPOS = ['Figuras', 'Llaveros', 'Adornos', 'Lapiceros'];
const TAMAÑOS = ['5cm', '8cm', '12cm', '18cm', '25cm'];

const ProductosAdmin = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null); // _id si edita, null si crea
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [subiendoImg, setSubiendoImg] = useState(false);
  const fileInputRef = useRef(null);

  // ═══════════ CARGAR ═══════════
  const cargar = async () => {
    setCargando(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productosAPI.listar(),
        categoriasAPI.listar(),
      ]);
      setProductos(prodRes.data.productos || prodRes.data || []);
      setCategorias(catRes.data.categorias || catRes.data || []);
    } catch (err) {
      console.error('Error cargando:', err);
      setError('No pudimos cargar los datos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // ═══════════ FILTRAR ═══════════
  const productosFiltrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(buscar.toLowerCase())
  );

  // ═══════════ ABRIR MODAL ═══════════
  const abrirCrear = () => {
    setEditando(null);
    setForm({
      ...FORM_VACIO,
      categoria: categorias[0]?.nombre || '',
    });
    setError('');
    setModalAbierto(true);
  };

  const abrirEditar = (p) => {
    setEditando(p._id);
    setForm({
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      descripcionLarga: p.descripcionLarga || '',
      precio: p.precio || '',
      precioOferta: p.precioOferta || '',
      stock: p.stock || 0,
      categoria: typeof p.categoria === 'string' ? p.categoria : p.categoria?.nombre || '',
      tipo: p.tipo || 'Figuras',
      tamaño: p.tamaño || '12cm',
      imagenes: p.imagenes || (p.imagen ? [p.imagen] : []),
      etiquetas: p.etiquetas || [],
      activo: p.activo !== false,
    });
    setError('');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditando(null);
    setForm(FORM_VACIO);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ═══════════ SUBIR IMAGEN ═══════════
  const handleSubirImagen = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede pesar más de 5 MB');
      return;
    }

    setSubiendoImg(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('imagen', archivo);
      const res = await uploadAPI.subir(fd);
      const url = res.data.url || res.data.secure_url;
      if (!url) throw new Error('Sin URL');

      setForm((f) => ({
        ...f,
        imagenes: [...(f.imagenes || []), url],
      }));
    } catch (err) {
      setError(
        err.response?.data?.mensaje || 'Error subiendo la imagen'
      );
    } finally {
      setSubiendoImg(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const quitarImagen = (idx) => {
    setForm((f) => ({
      ...f,
      imagenes: f.imagenes.filter((_, i) => i !== idx),
    }));
  };

  // ═══════════ GUARDAR ═══════════
  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        descripcionLarga: form.descripcionLarga.trim(),
        precio: Number(form.precio),
        precioOferta: form.precioOferta ? Number(form.precioOferta) : undefined,
        stock: Number(form.stock),
        categoria: form.categoria,
        tipo: form.tipo,
        tamaño: form.tamaño,
        imagenes: form.imagenes,
        etiquetas: form.etiquetas,
        activo: form.activo,
      };

      if (editando) {
        await productosAPI.actualizar(editando, payload);
      } else {
        await productosAPI.crear(payload);
      }

      await cargar();
      cerrarModal();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No pudimos guardar el producto'
      );
    } finally {
      setEnviando(false);
    }
  };

  // ═══════════ ELIMINAR ═══════════
  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await productosAPI.eliminar(id);
      await cargar();
    } catch (err) {
      alert('Error eliminando: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  // ═══════════ RENDER ═══════════
  return (
    <div className="max-w-7xl mx-auto">

      {/* ENCABEZADO */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white">
            GESTIÓN DE <span className="text-neon-cyan text-glow-cyan">PRODUCTOS</span>
          </h1>
          <p className="text-gray-400 mt-2 font-body text-sm">
            {productos.length} producto{productos.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 px-5 py-3 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition shadow-neon-cyan"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-neon-cyan/30 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-cyan transition"
        />
      </div>

      {/* LISTA */}
      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-20 bg-dark-800 border border-neon-cyan/20 rounded-xl">
          <Package className="w-16 h-16 text-neon-cyan/40 mx-auto mb-4" />
          <p className="text-gray-400 font-body">
            {buscar ? 'Sin resultados' : 'No hay productos todavía'}
          </p>
        </div>
      ) : (
        <div className="bg-dark-800 border border-neon-cyan/30 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-700 border-b border-neon-cyan/20">
                <tr className="text-xs uppercase tracking-wider text-neon-cyan font-display">
                  <th className="text-left p-4">Imagen</th>
                  <th className="text-left p-4">Nombre</th>
                  <th className="text-left p-4">Categoría</th>
                  <th className="text-right p-4">Precio</th>
                  <th className="text-center p-4">Stock</th>
                  <th className="text-center p-4">Activo</th>
                  <th className="text-right p-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-neon-cyan/5 hover:bg-dark-700/40 transition"
                  >
                    <td className="p-4">
                      <div className="w-12 h-12 bg-dark-700 rounded overflow-hidden flex items-center justify-center">
                        {p.imagenes?.[0] || p.imagen ? (
                          <img
                            src={p.imagenes?.[0] || p.imagen}
                            alt={p.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-neon-cyan/40 text-[10px] font-display">TP</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-body font-medium">{p.nombre}</p>
                      <p className="text-xs text-gray-500 font-body">
                        {p.tipo} · {p.tamaño}
                      </p>
                    </td>
                    <td className="p-4 text-gray-400 font-body text-sm">
                      {typeof p.categoria === 'string'
                        ? p.categoria
                        : p.categoria?.nombre || '—'}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-neon-green font-display font-bold">
                        ${Number(p.precio || 0).toFixed(2)}
                      </span>
                      {p.precioOferta && (
                        <span className="block text-xs text-gray-500 line-through">
                          ${Number(p.precioOferta).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`font-display font-bold ${
                          p.stock > 0 ? 'text-neon-cyan' : 'text-neon-pink'
                        }`}
                      >
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {p.activo !== false ? (
                        <span className="inline-flex items-center gap-1 text-neon-green text-xs">
                          <Check className="w-3 h-3" /> Sí
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">No</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirEditar(p)}
                          className="p-2 text-neon-cyan hover:bg-neon-cyan/10 rounded transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(p._id, p.nombre)}
                          className="p-2 text-neon-pink hover:bg-neon-pink/10 rounded transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL ═══════════ */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl my-8 bg-dark-800 border border-neon-cyan/40 rounded-2xl shadow-neon-cyan"
          >
            {/* Header modal */}
            <div className="flex items-center justify-between p-5 border-b border-neon-cyan/20">
              <h2 className="font-display text-xl font-bold text-white uppercase tracking-wider">
                {editando ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button
                onClick={cerrarModal}
                className="p-2 text-gray-400 hover:text-neon-pink transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleGuardar} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Nombre */}
              <Field label="Nombre *">
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  className="input-base"
                />
              </Field>

              {/* Descripciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Descripción corta">
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    rows={2}
                    className="input-base resize-none"
                  />
                </Field>
                <Field label="Descripción larga">
                  <textarea
                    value={form.descripcionLarga}
                    onChange={(e) => setForm({ ...form, descripcionLarga: e.target.value })}
                    rows={2}
                    className="input-base resize-none"
                  />
                </Field>
              </div>

              {/* Precios y stock */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Precio *">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    required
                    className="input-base"
                  />
                </Field>
                <Field label="Precio oferta">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.precioOferta}
                    onChange={(e) => setForm({ ...form, precioOferta: e.target.value })}
                    className="input-base"
                  />
                </Field>
                <Field label="Stock">
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="input-base"
                  />
                </Field>
              </div>

              {/* Categoría + tipo + tamaño */}
              <div className="grid grid-cols-3 gap-4">
                <Field label="Categoría *">
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    required
                    className="input-base"
                  >
                    <option value="">Selecciona...</option>
                    {categorias.map((c) => (
                      <option key={c._id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tipo">
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="input-base"
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tamaño">
                  <select
                    value={form.tamaño}
                    onChange={(e) => setForm({ ...form, tamaño: e.target.value })}
                    className="input-base"
                  >
                    {TAMAÑOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Imágenes */}
              <Field label="Imágenes (Cloudinary)">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSubirImagen}
                  className="hidden"
                />
                <div className="space-y-3">
                  {form.imagenes.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                      {form.imagenes.map((url, i) => (
                        <div
                          key={i}
                          className="relative w-20 h-20 bg-dark-700 rounded border border-neon-cyan/30 overflow-hidden group"
                        >
                          <img
                            src={url}
                            alt={`Imagen ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => quitarImagen(i)}
                            className="absolute inset-0 bg-neon-pink/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                          >
                            <X className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={subiendoImg}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-dark-700 border-2 border-dashed border-neon-cyan/30 rounded hover:border-neon-cyan text-gray-400 hover:text-neon-cyan transition disabled:opacity-50"
                  >
                    {subiendoImg ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Subir imagen
                      </>
                    )}
                  </button>
                </div>
              </Field>

              {/* Activo */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="w-5 h-5 accent-neon-cyan"
                />
                <span className="text-white font-body text-sm">
                  Producto visible en la tienda
                </span>
              </label>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-neon-pink/10 border border-neon-pink/40 rounded">
                  <AlertCircle className="w-4 h-4 text-neon-pink flex-shrink-0 mt-0.5" />
                  <p className="text-neon-pink text-sm font-body">{error}</p>
                </div>
              )}
            </form>

            {/* Footer modal */}
            <div className="flex justify-end gap-3 p-5 border-t border-neon-cyan/20">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition disabled:opacity-50"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar
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

// Helper para campos
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
      {label}
    </label>
    {children}
  </div>
);

export default ProductosAdmin;