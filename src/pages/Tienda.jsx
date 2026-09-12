import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { productosAPI, categoriasAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

const ORDENES = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nombre', label: 'Nombre A-Z' },
];

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'figura', label: 'Figuras' },
  { value: 'llavero', label: 'Llaveros' },
  { value: 'adorno', label: 'Adornos' },
  { value: 'lapicero', label: 'Lapiceros' },
];

const Tienda = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Filtros (los inicializo desde la URL para que /tienda?categoria=X funcione)
  const [buscar, setBuscar] = useState(searchParams.get('buscar') || '');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '');
  const [tipo, setTipo] = useState(searchParams.get('tipo') || '');
  const [orden, setOrden] = useState(searchParams.get('orden') || 'recientes');

  // Cargar categorías 1 sola vez
  useEffect(() => {
    categoriasAPI
      .listar()
      .then((res) => setCategorias(res.data.categorias || res.data || []))
      .catch((err) => console.error('Error categorías:', err));
  }, []);

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    setCargando(true);
    const params = {};
    if (buscar.trim()) params.buscar = buscar.trim();
    if (categoria) params.categoria = categoria;
    if (tipo) params.tipo = tipo;
    if (orden) params.orden = orden;

    productosAPI
      .listar(params)
      .then((res) => {
        setProductos(res.data.productos || res.data || []);
      })
      .catch((err) => console.error('Error productos:', err))
      .finally(() => setCargando(false));

    // Sincronizar URL
    const nuevos = {};
    if (buscar.trim()) nuevos.buscar = buscar.trim();
    if (categoria) nuevos.categoria = categoria;
    if (tipo) nuevos.tipo = tipo;
    if (orden && orden !== 'recientes') nuevos.orden = orden;
    setSearchParams(nuevos, { replace: true });
  }, [buscar, categoria, tipo, orden]);

  const limpiarFiltros = () => {
    setBuscar('');
    setCategoria('');
    setTipo('');
    setOrden('recientes');
  };

  const hayFiltrosActivos = buscar || categoria || tipo || orden !== 'recientes';

  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ═══════════ ENCABEZADO ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 className="font-display text-4xl md:text-6xl font-black text-white">
            NUESTRA <span className="text-neon-cyan text-glow-cyan">TIENDA</span>
          </h1>
          <p className="text-gray-400 mt-3 font-body">
            Explora todas las figuras, llaveros, adornos y lapiceros impresos en 3D
          </p>
        </motion.div>

        {/* ═══════════ BARRA DE BÚSQUEDA + FILTROS ═══════════ */}
        <div className="mb-8 space-y-4">

          {/* Buscador + botón filtros móvil */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar figuras, personajes, llaveros..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-neon-cyan/30 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-cyan focus:shadow-neon-cyan transition"
              />
              {buscar && (
                <button
                  onClick={() => setBuscar('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neon-pink transition"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setFiltrosAbiertos((v) => !v)}
              className="md:hidden px-4 bg-dark-800 border border-neon-cyan/30 rounded-lg text-neon-cyan hover:border-neon-pink transition"
              aria-label="Filtros"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Filtros (siempre visibles en desktop, togglables en móvil) */}
          <div className={`${filtrosAbiertos ? 'block' : 'hidden md:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-dark-800 border border-neon-cyan/20 rounded-lg">

              {/* Categoría */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
                  <Filter className="w-3 h-3 inline mr-1" />
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-neon-cyan/20 rounded text-white text-sm font-body focus:outline-none focus:border-neon-cyan"
                >
                  <option value="">Todas</option>
                  {categorias.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
                  Tipo
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-neon-cyan/20 rounded text-white text-sm font-body focus:outline-none focus:border-neon-cyan"
                >
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Orden */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
                  Ordenar por
                </label>
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-neon-cyan/20 rounded text-white text-sm font-body focus:outline-none focus:border-neon-cyan"
                >
                  {ORDENES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Limpiar */}
              <div className="flex items-end">
                <button
                  onClick={limpiarFiltros}
                  disabled={!hayFiltrosActivos}
                  className="w-full px-3 py-2 text-sm font-display uppercase tracking-wider border border-neon-pink text-neon-pink rounded hover:bg-neon-pink hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neon-pink"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ RESULTADOS ═══════════ */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400 text-sm font-body">
            {cargando
              ? 'Cargando productos...'
              : `${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}`}
          </p>
        </div>

        {/* ═══════════ GRID ═══════════ */}
        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-dark-800 border border-neon-cyan/10 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="font-display text-2xl text-neon-pink mb-3">Sin resultados</h3>
            <p className="text-gray-400 font-body mb-6">
              No encontramos productos con esos filtros.
            </p>
            <button
              onClick={limpiarFiltros}
              className="px-6 py-2 border border-neon-cyan text-neon-cyan rounded font-display uppercase tracking-wider text-sm hover:bg-neon-cyan hover:text-black transition"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {productos.map((p) => (
              <ProductCard key={p._id} producto={p} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Tienda;