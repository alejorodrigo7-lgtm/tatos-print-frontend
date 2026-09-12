import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Trash2, Minus, Plus, ArrowRight, Tag, X, AlertCircle,
  Check, Percent,
} from 'lucide-react';
import { useCartStore, useAuthStore } from '../context/store';
import { cuponesAPI } from '../services/api';

const Carrito = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items, removeItem, updateCantidad, clearCart, getTotal,
  } = useCartStore();

  const [codigoCupon, setCodigoCupon] = useState('');
  const [cupon, setCupon] = useState(null);
  const [errorCupon, setErrorCupon] = useState('');
  const [validando, setValidando] = useState(false);

  const subtotal = getTotal();

  // Tu backend devuelve { codigo, descuento } — siempre es porcentaje
  const calcularDescuento = (cup, sub) => {
    if (!cup) return 0;
    const valor = Number(cup.descuento ?? cup.valor ?? cup.porcentaje ?? 0);
    if (!valor || valor <= 0) return 0;
    return (sub * valor) / 100;
  };

  const descuento = calcularDescuento(cupon, subtotal);
  const total = Math.max(0, subtotal - descuento);

  const handleValidarCupon = async () => {
    if (!codigoCupon.trim()) return;
    setValidando(true);
    setErrorCupon('');
    try {
      const res = await cuponesAPI.validar(codigoCupon.trim().toUpperCase());
      const data = res.data.cupon || res.data;
      if (!data || !data.codigo) {
        setCupon(null);
        setErrorCupon('Cupón inválido o expirado');
      } else {
        setCupon(data);
      }
    } catch (err) {
      setCupon(null);
      setErrorCupon(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Cupón inválido o expirado'
      );
    } finally {
      setValidando(false);
    }
  };

  const handleQuitarCupon = () => {
    setCupon(null);
    setCodigoCupon('');
    setErrorCupon('');
  };

  const handleIrCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    // Guardamos el cupón en sessionStorage para que Checkout lo lea
    if (cupon) {
      sessionStorage.setItem('cupon', JSON.stringify(cupon));
    } else {
      sessionStorage.removeItem('cupon');
    }
    navigate('/checkout');
  };

  // ═══════════ CARRITO VACÁO ═══════════
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <ShoppingCart className="w-20 h-20 text-neon-cyan mx-auto mb-6 opacity-50" />
          <h1 className="font-display text-3xl md:text-4xl font-black text-white mb-3">
            Tu carrito está <span className="text-neon-cyan text-glow-cyan">vacío</span>
          </h1>
          <p className="text-gray-400 font-body mb-8">
            Explora nuestra tienda y encuentra tus personajes favoritos en 3D.
          </p>
          <Link
            to="/tienda"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition shadow-neon-cyan"
          >
            Ir a la tienda
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // ═══════════ CARRITO CON ITEMS ═══════════
  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ENCABEZADO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-end justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="font-display text-4xl md:text-6xl font-black text-white">
              TU <span className="text-neon-cyan text-glow-cyan">CARRITO</span>
            </h1>
            <p className="text-gray-400 mt-3 font-body">
              {items.length} {items.length === 1 ? 'producto' : 'productos'} listos para pedir
            </p>
          </div>
          <button
            onClick={clearCart}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon-pink transition font-body"
          >
            <Trash2 className="w-4 h-4" />
            Vaciar carrito
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ═══════════ LISTA DE ITEMS ═══════════ */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex gap-4 p-4 bg-dark-800 border border-neon-cyan/20 rounded-xl hover:border-neon-cyan/50 transition"
              >
                {/* Imagen */}
                <Link
                  to={`/producto/${item._id}`}
                  className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-dark-700 rounded-lg overflow-hidden flex items-center justify-center"
                >
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
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/producto/${item._id}`}
                      className="font-display text-sm sm:text-base font-bold text-white hover:text-neon-cyan transition line-clamp-2"
                    >
                      {item.nombre}
                    </Link>
                    <p className="text-neon-green font-display font-bold text-lg mt-1">
                      ${item.precio.toFixed(2)}
                    </p>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                    {/* Selector cantidad */}
                    <div className="inline-flex items-center border border-neon-cyan/40 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          item.cantidad > 1
                            ? updateCantidad(item._id, item.cantidad - 1)
                            : removeItem(item._id)
                        }
                        className="px-2 py-1.5 text-neon-cyan hover:bg-neon-cyan/10 transition"
                        aria-label="Menos"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1 font-display font-bold text-white text-sm min-w-[32px] text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateCantidad(item._id, item.cantidad + 1)}
                        className="px-2 py-1.5 text-neon-cyan hover:bg-neon-cyan/10 transition"
                        aria-label="Más"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal item */}
                    <span className="text-sm text-gray-400 font-body">
                      Subtotal:{' '}
                      <span className="text-neon-green font-bold">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </span>
                    </span>

                    {/* Eliminar */}
                    <button
                      onClick={() => removeItem(item._id)}
                      className="p-2 text-gray-400 hover:text-neon-pink transition"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ═══════════ RESUMEN ═══════════ */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-dark-800 border border-neon-cyan/30 rounded-xl p-6">
              <h2 className="font-display text-xl font-bold text-white mb-6 uppercase tracking-wider">
                Resumen
              </h2>

              {/* Subtotal */}
              <div className="flex justify-between text-gray-300 font-body mb-3">
                <span>Subtotal</span>
                <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
              </div>

              {/* Descuento */}
              {cupon && (
                <div className="flex justify-between text-neon-green font-body mb-3">
                  <span className="flex items-center gap-1">
                    <Percent className="w-4 h-4" />
                    {cupon.codigo}
                  </span>
                  <span className="font-bold">-${descuento.toFixed(2)}</span>
                </div>
              )}

              {/* Envío */}
              <div className="flex justify-between text-gray-400 font-body mb-3 text-sm">
                <span>Envío</span>
                <span>Calculado en checkout</span>
              </div>

              <div className="border-t border-neon-cyan/20 my-4" />

              {/* Total */}
              <div className="flex justify-between items-end mb-6">
                <span className="font-display uppercase tracking-wider text-white">Total</span>
                <span className="font-display text-3xl font-black text-neon-green text-glow-green">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Cupón */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Cupón de descuento
                </label>
                {cupon ? (
                  <div className="flex items-center justify-between p-3 bg-neon-green/10 border border-neon-green/40 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-neon-green" />
                      <span className="text-neon-green font-body text-sm font-bold">
                        {cupon.codigo} aplicado
                      </span>
                    </div>
                    <button
                      onClick={handleQuitarCupon}
                      className="text-gray-400 hover:text-neon-pink transition"
                      aria-label="Quitar cupón"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="TATOS10"
                        value={codigoCupon}
                        onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleValidarCupon()}
                        className="flex-1 px-3 py-2 bg-dark-700 border border-neon-cyan/30 rounded text-white placeholder-gray-500 font-body text-sm uppercase focus:outline-none focus:border-neon-cyan"
                      />
                      <button
                        onClick={handleValidarCupon}
                        disabled={validando || !codigoCupon.trim()}
                        className="px-4 py-2 bg-neon-cyan text-black font-display font-bold text-xs uppercase tracking-wider rounded hover:bg-neon-pink hover:text-white transition disabled:opacity-40"
                      >
                        {validando ? '...' : 'Aplicar'}
                      </button>
                    </div>
                    {errorCupon && (
                      <p className="flex items-center gap-1 text-neon-pink text-xs mt-2 font-body">
                        <AlertCircle className="w-3 h-3" />
                        {errorCupon}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Ir a checkout */}
              <button
                onClick={handleIrCheckout}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition shadow-neon-cyan hover:shadow-neon-pink"
              >
                Ir al checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/tienda"
                className="block text-center text-gray-400 hover:text-neon-cyan transition text-sm font-body mt-4"
              >
                â† Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;
