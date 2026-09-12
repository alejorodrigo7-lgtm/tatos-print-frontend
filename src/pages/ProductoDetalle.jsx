import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ShoppingCart, Star, Package, Truck, Shield, Minus, Plus,
  Check, AlertCircle, Sparkles,
} from 'lucide-react';
import { productosAPI } from '../services/api';
import { useCartStore } from '../context/store';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    setCargando(true);
    setError('');
    productosAPI
      .obtener(id)
      .then((res) => {
        const p = res.data.producto || res.data;
        setProducto(p);
      })
      .catch((err) => {
        console.error('Error producto:', err);
        setError('No pudimos cargar este producto.');
      })
      .finally(() => setCargando(false));
  }, [id]);

  const handleAgregar = () => {
    if (!producto) return;
    addItem(
      {
        _id: producto._id,
        nombre: producto.nombre,
        precio: precioFinal,
        imagen: producto.imagen,
      },
      cantidad
    );
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const handleComprarAhora = () => {
    handleAgregar();
    navigate('/carrito');
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4 font-body">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-neon-pink mx-auto mb-4" />
          <h1 className="font-display text-3xl text-neon-pink text-glow-pink mb-3">
            Producto no encontrado
          </h1>
          <p className="text-gray-400 font-body mb-6">
            {error || 'El producto que buscas no existe o fue eliminado.'}
          </p>
          <Link
            to="/tienda"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan text-black font-display uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // Precio final (con oferta si aplica)
  const enOferta =
    producto.precioOferta &&
    producto.precioOferta > 0 &&
    producto.precioOferta < producto.precio;

  const precioFinal = enOferta ? producto.precioOferta : producto.precio;

  const descuento = enOferta
    ? Math.round(((producto.precio - producto.precioOferta) / producto.precio) * 100)
    : 0;

  // Galería: si hay array `imagenes`, la usamos; si no, solo `imagen`
  const galeria =
    producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes
      : producto.imagen
      ? [producto.imagen]
      : [];

  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* VOLVER */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition mb-8 font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ═══════════ GALERÍA ═══════════ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square bg-dark-800 border border-neon-cyan/30 rounded-2xl overflow-hidden shadow-neon-cyan">
              <img
                src={
                  galeria[0] ||
                  'https://via.placeholder.com/600x600/12121a/00F0FF?text=Tatos+Print'
                }
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />

              {enOferta && (
                <span className="absolute top-4 right-4 px-3 py-1.5 text-sm font-display font-bold bg-neon-pink text-black rounded shadow-neon-pink">
                  -{descuento}%
                </span>
              )}

              {producto.personalizado && (
                <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-display uppercase tracking-widest bg-neon-purple text-white rounded">
                  Personalizado
                </span>
              )}
            </div>

            {/* Miniaturas */}
            {galeria.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {galeria.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-dark-800 border border-neon-cyan/20 rounded-lg overflow-hidden hover:border-neon-cyan transition cursor-pointer"
                  >
                    <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ═══════════ INFO ═══════════ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Categoría */}
            {producto.categoria?.nombre && (
              <Link
                to={`/tienda?categoria=${producto.categoria._id}`}
                className="inline-block px-3 py-1 mb-4 text-[10px] font-display uppercase tracking-widest bg-dark-800 border border-neon-cyan/50 text-neon-cyan rounded hover:border-neon-pink hover:text-neon-pink transition"
              >
                {producto.categoria.nombre}
              </Link>
            )}

            {/* Nombre */}
            <h1 className="font-display text-3xl md:text-4xl font-black text-white leading-tight">
              {producto.nombre}
            </h1>

            {/* Rating */}
            {producto.rating && (
              <div className="flex items-center gap-2 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(producto.rating)
                        ? 'fill-neon-yellow text-neon-yellow'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-400 font-body">
                  {producto.rating.toFixed(1)} / 5
                </span>
              </div>
            )}

            {/* Precio */}
            <div className="mt-6 flex items-end gap-3">
              <span className="font-display text-4xl md:text-5xl font-black text-neon-green text-glow-green">
                ${precioFinal.toFixed(2)}
              </span>
              {enOferta && (
                <span className="text-lg text-gray-500 line-through mb-2 font-body">
                  ${producto.precio.toFixed(2)}
                </span>
              )}
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <p className="mt-6 text-gray-300 font-body leading-relaxed">
                {producto.descripcion}
              </p>
            )}

            {/* Stock */}
            {typeof producto.stock === 'number' && (
              <div className="mt-6 flex items-center gap-2">
                {producto.stock > 0 ? (
                  <>
                    <Check className="w-5 h-5 text-neon-green" />
                    <span className="text-neon-green font-body text-sm">
                      {producto.stock} disponibles
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-neon-pink" />
                    <span className="text-neon-pink font-body text-sm">
                      Agotado temporalmente
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Selector cantidad */}
            <div className="mt-8">
              <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-3 font-display">
                Cantidad
              </label>
              <div className="inline-flex items-center border border-neon-cyan/40 rounded-lg overflow-hidden">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="px-4 py-3 text-neon-cyan hover:bg-neon-cyan/10 transition"
                  aria-label="Menos"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 font-display text-lg font-bold text-white min-w-[60px] text-center">
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad((c) => c + 1)}
                  className="px-4 py-3 text-neon-cyan hover:bg-neon-cyan/10 transition"
                  aria-label="Más"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAgregar}
                disabled={agregado || producto.stock === 0}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 font-display font-bold uppercase tracking-wider text-sm rounded transition-all ${
                  agregado
                    ? 'bg-neon-green text-black shadow-neon-green'
                    : 'bg-neon-cyan text-black hover:bg-neon-pink hover:text-white shadow-neon-cyan hover:shadow-neon-pink'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {agregado ? (
                  <>
                    <Check className="w-5 h-5" />
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Agregar al carrito
                  </>
                )}
              </button>
              <button
                onClick={handleComprarAhora}
                disabled={producto.stock === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 border border-neon-pink text-neon-pink font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                Comprar ahora
              </button>
            </div>

            {/* Garantías */}
            <div className="mt-10 pt-6 border-t border-neon-cyan/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Truck, color: 'cyan', txt: 'Envío a todo Ecuador' },
                { icon: Shield, color: 'green', txt: 'Empaque protegido' },
                { icon: Package, color: 'pink', txt: 'Impresión 3D artesanal' },
              ].map(({ icon: Icon, color, txt }) => (
                <div key={txt} className="flex items-center gap-2 text-xs text-gray-400 font-body">
                  <Icon className={`w-4 h-4 text-neon-${color} flex-shrink-0`} />
                  <span>{txt}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;