import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, User, Mail, Phone, Package, MessageSquare, Image as ImageIcon,
  Send, Check, AlertCircle, Loader2, Palette, Upload, X,
} from 'lucide-react';
import { personalizadosAPI, uploadAPI } from '../services/api';
import { useAuthStore } from '../context/store';

const Personalizados = () => {
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    descripcion: '',
    referencia: '',
    tipo: 'figura',
    tamaño: '12cm',
    cantidad: 1,
    imagenReferencia: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // ═══════════ SUBIR IMAGEN A CLOUDINARY ═══════════
  const handleImagenSeleccionada = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    // Validar tipo
    if (!archivo.type.startsWith('image/')) {
      setErrorImagen('Solo se permiten imágenes');
      return;
    }
    // Validar tamaño (5 MB)
    if (archivo.size > 5 * 1024 * 1024) {
      setErrorImagen('La imagen no puede pesar más de 5 MB');
      return;
    }

    setErrorImagen('');
    setSubiendoImagen(true);

    try {
      const formData = new FormData();
      formData.append('imagen', archivo);

      const res = await uploadAPI.subirCliente(formData);
      // El backend puede devolver { url } o { secure_url } o { imagen }
      const url =
        res.data.url ||
        res.data.secure_url ||
        res.data.imagen ||
        res.data.imagenUrl;

      if (!url) throw new Error('Sin URL en la respuesta');

      setForm((f) => ({ ...f, imagenReferencia: url }));
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      setErrorImagen(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No pudimos subir la imagen. Intenta de nuevo.'
      );
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleQuitarImagen = () => {
    setForm((f) => ({ ...f, imagenReferencia: '' }));
    setErrorImagen('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ═══════════ ENVIAR SOLICITUD ═══════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        descripcion: form.descripcion.trim(),
        referencia: form.referencia.trim(),
        tipo: form.tipo,
        tamaño: form.tamaño,
        cantidad: Number(form.cantidad),
        imagenReferencia: form.imagenReferencia.trim() || null,
      };

      await personalizadosAPI.crear(payload);
      setEnviado(true);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No pudimos enviar tu solicitud. Intenta de nuevo.'
      );
    } finally {
      setEnviando(false);
    }
  };

  // ═══════════ PANTALLA DE ÉXITO ═══════════
  if (enviado) {
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
            ¡Solicitud <span className="text-neon-green text-glow-green">enviada</span>!
          </h1>
          <p className="text-gray-400 font-body mb-8">
            Gracias {form.nombre.split(' ')[0]}. Te contactaremos pronto por email o
            WhatsApp para coordinar tu figura personalizada.
          </p>
          <button
            onClick={() => {
              setEnviado(false);
              setForm({
                nombre: user?.nombre || '',
                email: user?.email || '',
                telefono: user?.telefono || '',
                descripcion: '',
                referencia: '',
                tipo: 'figura',
                tamaño: '12cm',
                cantidad: 1,
                imagenReferencia: '',
              });
            }}
            className="px-6 py-3 border border-neon-cyan text-neon-cyan font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-cyan hover:text-black transition"
          >
            Hacer otra solicitud
          </button>
        </motion.div>
      </div>
    );
  }

  // ═══════════ FORMULARIO ═══════════
  return (
    <div className="min-h-screen bg-dark-900 bg-grid">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ENCABEZADO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Palette className="w-12 h-12 text-neon-pink mx-auto mb-4 animate-pulse" />
          <h1 className="font-display text-4xl md:text-6xl font-black text-white">
            PEDIDOS <span className="text-neon-pink text-glow-pink">PERSONALIZADOS</span>
          </h1>
          <p className="text-gray-400 mt-3 font-body max-w-xl mx-auto">
            ¿Tienes una idea única? Cuéntanos qué personaje quieres y lo diseñamos e
            imprimimos especialmente para ti.
          </p>
        </motion.div>

        {/* FORMULARIO */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 border border-neon-pink/30 rounded-2xl p-6 sm:p-8 shadow-neon-pink space-y-6"
        >

          {/* ─────── DATOS DE CONTACTO ─────── */}
          <div>
            <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-neon-pink" />
              Tus datos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input icon={User} label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
              <Input icon={Mail} label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Input icon={Phone} label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} required />
            </div>
          </div>

          {/* ─────── DETALLES DEL PEDIDO ─────── */}
          <div className="pt-5 border-t border-neon-pink/20">
            <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-neon-pink" />
              Detalles del pedido
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
                  Tipo
                </label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-700 border border-neon-pink/20 rounded text-white font-body text-sm focus:outline-none focus:border-neon-pink"
                >
                  <option value="figura">Figura</option>
                  <option value="llavero">Llavero</option>
                  <option value="adorno">Adorno</option>
                  <option value="lapicero">Lapicero</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
                  Tamaño
                </label>
                <select
                  name="tamaño"
                  value={form.tamaño}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-700 border border-neon-pink/20 rounded text-white font-body text-sm focus:outline-none focus:border-neon-pink"
                >
                  <option value="5cm">5 cm</option>
                  <option value="8cm">8 cm</option>
                  <option value="12cm">12 cm</option>
                  <option value="18cm">18 cm</option>
                  <option value="25cm">25 cm</option>
                </select>
              </div>

              <Input
                label="Cantidad"
                name="cantidad"
                type="number"
                min="1"
                value={form.cantidad}
                onChange={handleChange}
                required
              />
            </div>

            {/* Descripción */}
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
                <MessageSquare className="w-3 h-3 inline mr-1" />
                Descripción del personaje
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={4}
                required
                placeholder="Ej: Naruto en modo sabio con capa naranja, pose de batalla, base rocosa..."
                className="w-full px-4 py-3 bg-dark-700 border border-neon-pink/20 rounded text-white placeholder-gray-500 font-body text-sm focus:outline-none focus:border-neon-pink resize-none"
              />
            </div>

            {/* ─────── SUBIDA DE IMAGEN ─────── */}
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
                <ImageIcon className="w-3 h-3 inline mr-1" />
                Imagen de referencia (opcional)
              </label>

              {/* Input file oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImagenSeleccionada}
                className="hidden"
              />

              {/* Si NO hay imagen: botón para subir */}
              {!form.imagenReferencia ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={subiendoImagen}
                  className="w-full flex items-center justify-center gap-3 px-4 py-8 bg-dark-700 border-2 border-dashed border-neon-pink/30 rounded-lg text-gray-400 hover:border-neon-pink hover:text-neon-pink transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subiendoImagen ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-neon-pink" />
                      <span className="font-body text-sm">Subiendo imagen...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6" />
                      <div className="text-left">
                        <p className="font-display text-sm uppercase tracking-wider text-neon-pink">
                          Subir imagen
                        </p>
                        <p className="text-xs text-gray-500 font-body">
                          JPG, PNG o WEBP · máx 5 MB
                        </p>
                      </div>
                    </>
                  )}
                </button>
              ) : (
                // Si SÍ hay imagen: preview + botón X
                <div className="relative bg-dark-700 border border-neon-pink/30 rounded-lg p-3 flex items-center gap-3">
                  <img
                    src={form.imagenReferencia}
                    alt="Referencia"
                    className="w-20 h-20 object-cover rounded border border-neon-pink/20"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-neon-green text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Imagen subida
                    </p>
                    <p className="text-gray-500 text-xs font-body truncate mt-1">
                      {form.imagenReferencia}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuitarImagen}
                    className="p-2 text-gray-400 hover:text-neon-pink transition"
                    aria-label="Quitar imagen"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Error de imagen */}
              {errorImagen && (
                <p className="flex items-center gap-1 text-neon-pink text-xs mt-2 font-body">
                  <AlertCircle className="w-3 h-3" />
                  {errorImagen}
                </p>
              )}
            </div>

            {/* Referencia extra */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Referencia o nota extra
              </label>
              <input
                type="text"
                name="referencia"
                value={form.referencia}
                onChange={handleChange}
                placeholder="Ej: Anime Naruto Shippuden, look clásico"
                className="w-full px-4 py-3 bg-dark-700 border border-neon-pink/20 rounded text-white placeholder-gray-500 font-body text-sm focus:outline-none focus:border-neon-pink"
              />
            </div>
          </div>

          {/* ─────── ERROR GENERAL ─────── */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-neon-pink/10 border border-neon-pink/40 rounded">
              <AlertCircle className="w-4 h-4 text-neon-pink flex-shrink-0 mt-0.5" />
              <p className="text-neon-pink text-sm font-body">{error}</p>
            </div>
          )}

          {/* ─────── BOTÓN ENVIAR ─────── */}
          <button
            type="submit"
            disabled={enviando || subiendoImagen}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-neon-pink text-white font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-cyan hover:text-black transition shadow-neon-pink hover:shadow-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar solicitud
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center font-body">
            Responderemos en menos de 24 horas con un presupuesto personalizado.
          </p>
        </motion.form>
      </div>
    </div>
  );
};

// Input reutilizable
const Input = ({ icon: Icon, label, ...props }) => (
  <div>
    <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
      {Icon && <Icon className="w-3 h-3 inline mr-1" />}
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-3 bg-dark-700 border border-neon-pink/20 rounded text-white placeholder-gray-500 font-body text-sm focus:outline-none focus:border-neon-pink transition"
    />
  </div>
);

export default Personalizados;