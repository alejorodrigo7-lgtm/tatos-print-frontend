import { Link } from 'react-router-dom';
import { Sparkles, Camera, Users, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-20 bg-dark-800 border-t border-neon-cyan/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* MARCA */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-neon-pink" />
              <span className="font-display text-2xl font-black text-neon-cyan text-glow-cyan">
                TATOS PRINT
              </span>
            </Link>
            <p className="text-gray-400 font-body text-sm leading-relaxed max-w-md">
              Figuras, llaveros, adornos y lapiceros impresos en 3D de tus personajes
              favoritos. Anime, clásicos, Disney, DreamWorks y Harry Potter — hechos con
              amor y precisión milimétrica.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-neon-cyan/40 rounded hover:border-neon-pink hover:text-neon-pink text-neon-cyan transition"
                aria-label="Instagram"
              >
                <Camera className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-neon-cyan/40 rounded hover:border-neon-pink hover:text-neon-pink text-neon-cyan transition"
                aria-label="Facebook"
              >
                <Users className="w-5 h-5" />
              </a>
              <a
                href="mailto:hola@tatosprint.com"
                className="p-2 border border-neon-cyan/40 rounded hover:border-neon-pink hover:text-neon-pink text-neon-cyan transition"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* TIENDA */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-neon-pink mb-4 text-glow-pink">
              Tienda
            </h4>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <Link to="/tienda" className="text-gray-400 hover:text-neon-cyan transition">
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link to="/personalizados" className="text-gray-400 hover:text-neon-cyan transition">
                  Pedidos personalizados
                </Link>
              </li>
              <li>
                <Link to="/seguimiento" className="text-gray-400 hover:text-neon-cyan transition">
                  Seguir mi pedido
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="text-gray-400 hover:text-neon-cyan transition">
                  Mi carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* CUENTA */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-neon-pink mb-4 text-glow-pink">
              Cuenta
            </h4>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <Link to="/login" className="text-gray-400 hover:text-neon-cyan transition">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link to="/registro" className="text-gray-400 hover:text-neon-cyan transition">
                  Crear cuenta
                </Link>
              </li>
              <li>
                <Link to="/mis-pedidos" className="text-gray-400 hover:text-neon-cyan transition">
                  Mis pedidos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* CONTACTO + HASHTAGS */}
        <div className="mt-10 pt-6 border-t border-neon-cyan/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4 text-neon-green" />
            <span>Ecuador · Envíos a todo el país</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-display tracking-widest">
            <span className="text-neon-cyan">#TatosPrint</span>
            <span className="text-neon-pink">#FigurasEn3D</span>
            <span className="text-neon-green">#Impresión3D</span>
            <span className="text-neon-yellow">#Anime</span>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="mt-6 text-center text-xs text-gray-500 font-body">
          © {new Date().getFullYear()} Tatos Print. Todos los derechos reservados. Hecho con 💜 en Ecuador.
          <p className="font-display text-sm uppercase tracking-widest mt-3">
            <span className="text-gray-500">Desarrollado por </span>
            <span className="text-neon-cyan text-glow-cyan font-black">RA2P</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
