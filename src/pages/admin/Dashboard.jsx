import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, ShoppingBag, FolderTree, Ticket, DollarSign, Users, TrendingUp,
  ArrowRight, Loader2, Palette,
} from 'lucide-react';
import { productosAPI, pedidosAPI, categoriasAPI, cuponesAPI, personalizadosAPI } from '../../services/api';
import { useAuthStore } from '../../context/store';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    productos: 0,
    pedidos: 0,
    categorias: 0,
    cupones: 0,
    personalizados: 0,
    personalizadosPendientes: 0,
    ingresos: 0,
    pendientes: 0,
  });
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [prodRes, pedRes, catRes, cupRes, persRes] = await Promise.allSettled([
          productosAPI.listar(),
          pedidosAPI.listar(),
          categoriasAPI.listar(),
          cuponesAPI.listar(),
          personalizadosAPI.listar(),
        ]);

        const productos =
          prodRes.status === 'fulfilled'
            ? prodRes.value.data.productos || prodRes.value.data || []
            : [];
        const pedidos =
          pedRes.status === 'fulfilled'
            ? pedRes.value.data.pedidos || pedRes.value.data || []
            : [];
        const categorias =
          catRes.status === 'fulfilled'
            ? catRes.value.data.categorias || catRes.value.data || []
            : [];
        const cupones =
          cupRes.status === 'fulfilled'
            ? cupRes.value.data.cupones || cupRes.value.data || []
            : [];

        const personalizados =
          persRes.status === 'fulfilled'
            ? persRes.value.data.personalizados || persRes.value.data || []
            : [];

        const personalizadosPendientes = personalizados.filter(
          (p) => p.estado === 'pendiente'
        ).length;

        const ingresos = pedidos
          .filter((p) => p.estado !== 'cancelado')
          .reduce((acc, p) => acc + Number(p.total || 0), 0);

        const pendientes = pedidos.filter((p) =>
          ['pendiente', 'en_preparacion', 'impreso'].includes(p.estado)
        ).length;

        setStats({
          productos: productos.length,
          pedidos: pedidos.length,
          categorias: categorias.length,
          cupones: cupones.length,
          personalizados: personalizados.length,
          personalizadosPendientes,
          ingresos,
          pendientes,
        });

        setPedidosRecientes(pedidos.slice(0, 5));
      } catch (err) {
        console.error('Error dashboard:', err);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'â€”';
    try {
      return new Date(fecha).toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return 'â€”';
    }
  };

  const TARJETAS = [
    {
      label: 'Ingresos totales',
      value: `$${stats.ingresos.toFixed(2)}`,
      icon: DollarSign,
      color: 'green',
      link: '/admin/pedidos',
    },
    {
      label: 'Pedidos',
      value: stats.pedidos,
      sub: `${stats.pendientes} pendientes`,
      icon: ShoppingBag,
      color: 'cyan',
      link: '/admin/pedidos',
    },
    {
      label: 'Productos',
      value: stats.productos,
      icon: Package,
      color: 'pink',
      link: '/admin/productos',
    },
    {
      label: 'CategorÃ­as',
      value: stats.categorias,
      icon: FolderTree,
      color: 'purple',
      link: '/admin/categorias',
    },
    {
      label: 'Cupones activos',
      value: stats.cupones,
      icon: Ticket,
      color: 'yellow',
      link: '/admin/cupones',
    },
    {
      label: 'Personalizados',
      value: stats.personalizados,
      sub: `${stats.personalizadosPendientes} pendientes`,
      icon: Palette,
      color: 'purple',
      link: '/admin/personalizados',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      {/* ENCABEZADO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl md:text-5xl font-black text-white">
          HOLA, <span className="text-neon-cyan text-glow-cyan">{user?.nombre?.split(' ')[0] || 'ADMIN'}</span>
        </h1>
        <p className="text-gray-400 mt-2 font-body">
          Panel de control de Tatos Print
        </p>
      </motion.div>

      {/* TARJETAS DE STATS */}
      {cargando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-dark-800 border border-neon-cyan/10 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {TARJETAS.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={t.link}
                  className={`block p-5 bg-dark-800 border border-neon-${t.color}/30 rounded-xl hover:border-neon-${t.color} hover:shadow-neon-${t.color} transition-all group`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-6 h-6 text-neon-${t.color}`} />
                    <ArrowRight
                      className={`w-4 h-4 text-neon-${t.color} opacity-0 group-hover:opacity-100 transition`}
                    />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-display mb-1">
                    {t.label}
                  </p>
                  <p className={`font-display text-2xl font-black text-neon-${t.color} text-glow-${t.color}`}>
                    {t.value}
                  </p>
                  {t.sub && (
                    <p className="text-xs text-gray-500 mt-1 font-body">{t.sub}</p>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* PEDIDOS RECIENTES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800 border border-neon-cyan/30 rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-neon-cyan/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">
              Pedidos recientes
            </h2>
          </div>
          <Link
            to="/admin/pedidos"
            className="text-xs text-neon-cyan hover:text-neon-pink transition font-display uppercase tracking-wider flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
          </div>
        ) : pedidosRecientes.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-body">
            No hay pedidos todavÃ­a
          </div>
        ) : (
          <div className="divide-y divide-neon-cyan/10">
            {pedidosRecientes.map((p) => (
              <Link
                key={p._id}
                to="/admin/pedidos"
                className="flex items-center justify-between p-4 hover:bg-dark-700/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-neon-yellow truncate">
                      {p.codigoPedido || `#${p._id?.slice(-6)}`}
                    </p>
                    <p className="text-xs text-gray-500 font-body">
                      {p.productos?.length || 0} producto{(p.productos?.length || 0) !== 1 ? 's' : ''} Â·{' '}
                      {formatearFecha(p.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-sm font-bold text-neon-green">
                    ${Number(p.total || 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-display">
                    {p.estado || 'pendiente'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;