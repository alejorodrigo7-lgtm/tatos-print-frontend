import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle, Sparkles, Check } from 'lucide-react';
import { clientesAPI } from '../services/api';
import { useAuthStore } from '../context/store';

const Registro = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmar: '',
  });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones del lado cliente
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setEnviando(true);
    try {
      const res = await clientesAPI.registrar({
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        telefono: form.telefono.trim(),
        password: form.password,
      });

      // Algunos backends devuelven token al registrar → auto-login
      const data = res.data;
      const token = data.token;
      const user = data.cliente || data.usuario || data.user || data;

      if (token) {
        login(user, token);
        navigate('/', { replace: true });
      } else {
        // Sin token → mandamos a login con mensaje
        navigate('/login?registered=1', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No pudimos crear tu cuenta. Verifica los datos.'
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 bg-grid flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* LOGO */}
        <div className="text-center mb-8">
          <Sparkles className="w-10 h-10 text-neon-pink mx-auto mb-3 animate-pulse" />
          <h1 className="font-display text-3xl font-black text-neon-cyan text-glow-cyan">
            TATOS PRINT
          </h1>
        </div>

        {/* CARD */}
        <div className="bg-dark-800 border border-neon-pink/30 rounded-2xl p-8 shadow-neon-pink">
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            CREAR <span className="text-neon-pink">CUENTA</span>
          </h2>
          <p className="text-gray-400 text-sm font-body mb-6">
            Regístrate para guardar tus pedidos y comprar más rápido
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nombre */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
                <User className="w-3 h-3 inline mr-1" />
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
                className="w-full px-4 py-3 bg-dark-700 border border-neon-pink/20 rounded text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-pink transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
                <Mail className="w-3 h-3 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full px-4 py-3 bg-dark-700 border border-neon-pink/20 rounded text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-pink transition"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
                <Phone className="w-3 h-3 inline mr-1" />
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                required
                placeholder="0999999999"
                className="w-full px-4 py-3 bg-dark-700 border border-neon-pink/20 rounded text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-pink transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
                <Lock className="w-3 h-3 inline mr-1" />
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 bg-dark-700 border border-neon-pink/20 rounded text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-pink transition"
              />
            </div>

            {/* Confirmar password */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neon-pink mb-2 font-display">
                <Check className="w-3 h-3 inline mr-1" />
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmar"
                value={form.confirmar}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                className="w-full px-4 py-3 bg-dark-700 border border-neon-pink/20 rounded text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-pink transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-neon-pink/10 border border-neon-pink/40 rounded">
                <AlertCircle className="w-4 h-4 text-neon-pink flex-shrink-0 mt-0.5" />
                <p className="text-neon-pink text-sm font-body">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-pink text-white font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-cyan hover:text-black transition shadow-neon-pink hover:shadow-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm font-body">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-neon-cyan hover:text-neon-pink transition font-bold"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Registro;