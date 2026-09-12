import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { clientesAPI } from '../services/api';
import { useAuthStore } from '../context/store';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const res = await clientesAPI.login(form);
      const data = res.data;
      const token = data.token;
      const user = data.cliente || data.usuario || data.user || data;
      if (!token) {
        setError('Respuesta inválida del servidor');
        return;
      }
      login(user, token);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Credenciales incorrectas'
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
        <div className="bg-dark-800 border border-neon-cyan/30 rounded-2xl p-8 shadow-neon-cyan">
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            INICIAR <span className="text-neon-cyan">SESIÓN</span>
          </h2>
          <p className="text-gray-400 text-sm font-body mb-6">
            Accede para ver tus pedidos y comprar más rápido
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
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
                className="w-full px-4 py-3 bg-dark-700 border border-neon-cyan/20 rounded text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-cyan transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-neon-cyan mb-2 font-display">
                <Lock className="w-3 h-3 inline mr-1" />
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-dark-700 border border-neon-cyan/20 rounded text-white placeholder-gray-500 font-body focus:outline-none focus:border-neon-cyan transition"
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
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition shadow-neon-cyan hover:shadow-neon-pink disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              {enviando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Link a registro */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm font-body">
              ¿No tienes cuenta?{' '}
              <Link
                to="/registro"
                className="text-neon-pink hover:text-neon-cyan transition font-bold"
              >
                Crear una
              </Link>
            </p>
          </div>
        </div>

        {/* Hint temporal */}
        <div className="mt-6 p-4 bg-dark-800 border border-neon-yellow/30 rounded-lg">
          <p className="text-xs text-neon-yellow font-body text-center">
            <strong>Prueba:</strong> admin@tatosprint.com / admin2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;