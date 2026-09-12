import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Package, Palette, Zap } from 'lucide-react';
import { productosAPI, categoriasAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import heroImg from '../assets/hero.png';

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          productosAPI.listar({ orden: 'recientes' }),
          categoriasAPI.listar(),
        ]);
        setProductos(resProd.data.productos || resProd.data || []);
        setCategorias(resCat.data.categorias || resCat.data || []);
      } catch (err) {
        console.error('Error cargando Home:', err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const destacados = productos.slice(0, 8);

  return (
    <div>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-dark-900 bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/50 to-dark-900 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-neon-pink/50 rounded-full text-xs font-display uppercase tracking-widest text-neon-pink">
                <Sparkles className="w-3 h-3" />
                Hecho en Ecuador 🇪🇨
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                <span className="block text-white">TUS PERSONAJES</span>
                <span className="block text-white">FAVORITOS EN</span>
                <span className="block text-neon-cyan text-glow-cyan animate-glow">
                  3D
                </span>
              </h1>

              <p className="mt-6 text-gray-400 font-body text-lg max-w-lg leading-relaxed">
                Figuras, llaveros, adornos y lapiceros impresos en 3D de anime,
                clásicos, Disney, DreamWorks y Harry Potter. Precisión milimétrica,
                pasión infinita.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/tienda"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan text-black font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition-all shadow-neon-cyan hover:shadow-neon-pink"
                >
                  Ver tienda
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/personalizados"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-neon-pink text-neon-pink font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-pink hover:text-white transition-all"
                >
                  Pedido personalizado
                </Link>
              </div>

              {/* Mini stats */}
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                <div>
                  <div className="font-display text-2xl font-black text-neon-cyan">15+</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Productos</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-black text-neon-pink">6</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Categorías</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-black text-neon-green">100%</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Artesanal</div>
                </div>
              </div>
            </motion.div>

            {/* Imagen */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl rounded-full" />
              <img
                src={heroImg}
                alt="Figuras 3D Tatos Print"
                className="relative w-full max-w-md mx-auto animate-float drop-shadow-[0_0_30px_rgba(0,240,255,0.5)]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ BENEFICIOS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Package, color: 'cyan', titulo: 'Envío a todo Ecuador', desc: 'Empaque seguro y protegido' },
            { icon: Palette, color: 'pink', titulo: 'Personalizables', desc: 'Tu personaje, tu idea, tu figura' },
            { icon: Zap, color: 'green', titulo: 'Alta calidad', desc: 'Impresión 3D con acabados finos' },
          ].map(({ icon: Icon, color, titulo, desc }) => (
            <div
              key={titulo}
              className="flex items-start gap-4 p-5 bg-dark-800 border border-neon-cyan/20 rounded-xl hover:border-neon-cyan transition-all"
            >
              <div className={`p-2 rounded-lg bg-neon-${color}/10 border border-neon-${color}/40`}>
                <Icon className={`w-5 h-5 text-neon-${color}`} />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                  {titulo}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CATEGORÍAS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white">
              EXPLORA POR <span className="text-neon-pink text-glow-pink">CATEGORÍA</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm">Encuentra tu universo favorito</p>
          </div>
          <Link
            to="/tienda"
            className="hidden md:inline-flex items-center gap-1 text-neon-cyan hover:text-neon-pink text-sm font-display uppercase tracking-wider transition"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {cargando ? (
          <div className="text-center text-gray-500 py-10 font-body">Cargando categorías...</div>
        ) : categorias.length === 0 ? (
          <div className="text-center text-gray-500 py-10 font-body">
            No hay categorías disponibles
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categorias.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link
                  to={`/tienda?categoria=${cat._id}`}
                  className="block p-5 bg-dark-800 border border-neon-cyan/20 rounded-xl text-center hover:border-neon-pink hover:shadow-neon-pink transition-all group"
                >
                  <div className="font-display text-sm font-bold text-white group-hover:text-neon-pink transition uppercase tracking-wider">
                    {cat.nombre}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════ PRODUCTOS DESTACADOS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white">
              PRODUCTOS <span className="text-neon-cyan text-glow-cyan">DESTACADOS</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm">Los favoritos de nuestros clientes</p>
          </div>
          <Link
            to="/tienda"
            className="hidden md:inline-flex items-center gap-1 text-neon-cyan hover:text-neon-pink text-sm font-display uppercase tracking-wider transition"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {cargando ? (
          <div className="text-center text-gray-500 py-10 font-body">Cargando productos...</div>
        ) : destacados.length === 0 ? (
          <div className="text-center text-gray-500 py-10 font-body">
            No hay productos todavía
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destacados.map((p) => (
              <ProductCard key={p._id} producto={p} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/tienda"
            className="inline-flex items-center gap-2 px-8 py-3 border border-neon-cyan text-neon-cyan font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-cyan hover:text-black transition-all"
          >
            Ver todos los productos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════ CTA PERSONALIZADOS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-neon-purple/20 via-dark-800 to-neon-pink/20 border border-neon-pink/40 rounded-2xl p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <Sparkles className="w-10 h-10 text-neon-pink mx-auto mb-4 animate-pulse" />
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
              ¿Tienes una <span className="text-neon-pink text-glow-pink">idea única</span>?
            </h2>
            <p className="text-gray-300 font-body max-w-2xl mx-auto mb-8">
              Cuéntanos qué personaje quieres y lo diseñamos e imprimimos
              especialmente para ti. Desde una figura de colección hasta un llavero
              conmemorativo.
            </p>
            <Link
              to="/personalizados"
              className="inline-flex items-center gap-2 px-8 py-3 bg-neon-pink text-white font-display font-bold uppercase tracking-wider text-sm rounded hover:bg-neon-cyan hover:text-black transition-all shadow-neon-pink hover:shadow-neon-cyan"
            >
              Solicitar personalizado
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;