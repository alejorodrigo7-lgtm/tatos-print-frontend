import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, CreditCard, DollarSign, User, Phone, Mail, Home, ArrowLeft,
  Check, AlertCircle, ShoppingBag, Loader2,
} from 'lucide-react';
import { useCartStore, useAuthStore } from '../context/store';
import { pedidosAPI } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();

  const [cupon, setCupon] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [pedidoCreado, setPedidoCreado] = useState(null);

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    direccion: '',
    ciudad: '',
    provincia: '',
    referencia: '',
    metodoPago: 'contra_entrega',
    notas: '',
  });

  // Cargar cupón desde sessionStorage (lo dejó el Carrito)
  useEffect(() => {
    const guardado = sessionStorage.getItem('cupon');
    if (guardado) {
      try {
        setCupon(JSON.parse(guardado));
      } catch {
        sessionStorage.removeItem('cupon');
      }
    }
  }, []);

  // Redirigir si no hay user o carrito
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout', { replace: true });
    } else if (items.length === 0 && !pedidoCreado) {
      navigate('/carrito', { replace: true });
    }
  }, [user, items.length, pedidoCreado, navigate]);

  const subtotal = getTotal();
  // El backend devuelve { codigo, descuento } → siempre porcentaje
  const calcularDescuento = (cup, sub) => {
    if (!cup) return 0;
    const valor = Number(cup.descuento ?? cup.valor ?? cup.porcentaje ?? 0);
    if (!valor || valor <= 0) return 0;
    return (sub * valor) / 100;
  };

  const descuento = calcularDescuento(cupon, subtotal);
  const total = Math.max(0, subtotal - descuento);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const ENVIO_FIJO = 5;
      const payload = {
        productos: items.map((i) => ({
          producto: i._id,
          nombre: i.nombre,
          precio: i.precio,
          cantidad: i.cantidad,
          imagen: i.imagen,
        })),
        subtotal,
        envio: ENVIO_FIJO,
        descuento,
        total: subtotal + ENVIO_FIJO - descuento,
        cuponAplicado: cupon?.codigo || null,
        direccionEnvio: {
          calle: form.direccion,
          ciudad: form.ciudad,
          pais: 'Ecuador',
          codigoPostal: form.codigoPostal || '',
        },
        metodoPago: form.metodoPago,
        notas: form.notas || '',
      };

      const res = await pedidosAPI.crear(payload);
      const pedido = res.data.pedido || res.data;

      setPedidoCreado(pedido);
      clearCart();
      sessionStorage.removeItem('cupon');
    } catch (err) {
      console.error('Error pedido:', err);
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No pudimos procesar tu pedido. Intenta de nuevo.'
      );
    } finally {
      setEnviando(false);
    }
  };

  // ═══════════ PEDIDO CREADO ═══════════
  if (pedidoCreado) {
    const codigo = pedidoCreado.codigoPedido || pedidoCreado.codigo || pedidoCreado._id?.slice(-6).toUpperCase();
    return (
      <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <div className="w-24 h-24 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center mx-auto mb-6 shadow-neon-green">
            <Check className="w-12 h-12 text-neon-green" />
          </div>
          <h1 className="font-display text-4xl font-black text-white mb-3">
            ¡Pedido <span className="text-neon-green text-glow-green">confirmado</span>!
          </h1>
          <p className="text-gray-400 font-body mb-6">
            Gracias {form.nombre.split(' ')[0]}, ya estamos preparando tu figura 3D.
          </p>

          <div className="bg-dark-800 border border-neon-cyan/30 rounded-xl p-6 mb-8 text-left">
            <p className="text-xs uppercase tracking-widest text-neon-cyan font-display mb-2">
              Tu código de seguimiento
            </p>
            <p className="font-display text-2xl font-black text-neon-yellow">
              {codigo}
            </p>
            <p className="text-gray-400 text-xs mt-3 font-body">
              Guárdalo para consultar el estado en "Seguimiento".
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/seguimiento"
              className="px-6 py-3 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition"
            >
              Seguir pedido
            </Link>
            <Link
              to="/tienda"
              className="px-6 py-3 border border-neon-cyan text-neon-cyan font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-cyan hover:text-black transition"
            >
              Seguir comprando
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════ FORMULARIO ═══════════
  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <Link
          to="/carrito"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition mb-8 font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al carrito
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-display text-4xl md:text-6xl font-black text-white">
            FINALIZAR <span className="text-neon-cyan text-glow-cyan">PEDIDO</span>
          </h1>
          <p className="text-gray-400 mt-3 font-body">
            Completa tus datos y confirma tu compra
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ═══════════ FORMULARIO ═══════════ */}
            <div className="lg:col-span-2 space-y-6">

              {/* Datos personales */}
              <div className="bg-dark-800 border border-neon-cyan/20 rounded-xl p-6">
                <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-neon-cyan" />
                  Datos personales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    icon={User}
                    label="Nombre completo"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    icon={Mail}
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    icon={Phone}
                    label="Teléfono"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Dirección */}
              <div className="bg-dark-800 border border-neon-cyan/20 rounded-xl p-6">
                <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-neon-pink" />
                  Dirección de envío
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      icon={Home}
                      label="Dirección"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      placeholder="Calle principal y secundaria, número"
                      required
                    />
                  </div>
                  <Input
                    label="Ciudad"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Provincia"
                    name="provincia"
                    value={form.provincia}
                    onChange={handleChange}
                    required
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Referencia (opcional)"
                      name="referencia"
                      value={form.referencia}
                      onChange={handleChange}
                      placeholder="Ej: casa azul frente al parque"
                    />
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div className="bg-dark-800 border border-neon-cyan/20 rounded-xl p-6">
                <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-neon-green" />
                  Método de pago
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'contra_entrega', label: 'Pago contra entrega', icon: DollarSign },
                    { value: 'transferencia', label: 'Transferencia bancaria', icon: CreditCard },
                    { value: 'tarjeta', label: 'Tarjeta (próximamente)', icon: CreditCard },
                  ].map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${
                        form.metodoPago === value
                          ? 'border-neon-cyan bg-neon-cyan/10 shadow-neon-cyan'
                          : 'border-neon-cyan/20 hover:border-neon-cyan/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="metodoPago"
                        value={value}
                        checked={form.metodoPago === value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Icon
                        className={`w-5 h-5 ${
                          form.metodoPago === value ? 'text-neon-cyan' : 'text-gray-400'
                        }`}
                      />
                      <span
                        className={`font-body text-sm ${
                          form.metodoPago === value ? 'text-white font-bold' : 'text-gray-400'
                        }`}
                      >
                        {label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Notas */}
                <div className="mt-5">
                  <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    name="notas"
                    value={form.notas}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Instrucciones especiales, personalizaciones, etc."
                    className="w-full px-4 py-3 bg-dark-700 border border-neon-cyan/20 rounded text-white placeholder-gray-500 font-body text-sm focus:outline-none focus:border-neon-cyan resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ═══════════ RESUMEN LATERAL ═══════════ */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-dark-800 border border-neon-cyan/30 rounded-xl p-6">
                <h2 className="font-display text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-neon-cyan" />
                  Tu pedido
                </h2>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-5 pr-1">
                  {items.map((i) => (
                    <div key={i._id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-dark-700 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={i.imagen || 'https://via.placeholder.com/100/12121a/00F0FF?text=TP'}
                          alt={i.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-body truncate">{i.nombre}</p>
                        <p className="text-gray-400 text-xs">x{i.cantidad}</p>
                      </div>
                      <span className="text-neon-green text-sm font-bold font-display">
                        ${(i.precio * i.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neon-cyan/20 pt-4 space-y-2 font-body">
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {cupon && (
                    <div className="flex justify-between text-neon-green text-sm">
                      <span>Descuento ({cupon.codigo})</span>
                      <span>-${descuento.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Envío</span>
                    <span className="text-neon-cyan">$5.00</span>
                  </div>
                </div>

                <div className="border-t border-neon-cyan/20 mt-4 pt-4 flex justify-between items-end">
                  <span className="font-display uppercase tracking-wider text-white">Total</span>
                  <span className="font-display text-3xl font-black text-neon-green text-glow-green">
                    ${(total + 5).toFixed(2)}
                  </span>
                </div>

                {error && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-neon-pink/10 border border-neon-pink/40 rounded">
                    <AlertCircle className="w-4 h-4 text-neon-pink flex-shrink-0 mt-0.5" />
                    <p className="text-neon-pink text-xs font-body">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition shadow-neon-cyan hover:shadow-neon-pink disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirmar pedido
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4 font-body">
                  Al confirmar aceptas nuestros términos y condiciones.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente Input reutilizable
const Input = ({ icon: Icon, label, ...props }) => (
  <div>
    <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
      {Icon && <Icon className="w-3 h-3 inline mr-1" />}
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-3 bg-dark-700 border border-neon-cyan/20 rounded text-white placeholder-gray-500 font-body text-sm focus:outline-none focus:border-neon-cyan transition"
    />
  </div>
);

export default Checkout;