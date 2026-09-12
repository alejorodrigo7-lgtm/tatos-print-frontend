import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../context/store';

const ProductCard = ({ producto }) => {
  const addItem = useCartStore((s) => s.addItem);

  const precioFinal =
    producto.precioOferta && producto.precioOferta > 0
      ? producto.precioOferta
      : producto.precio;

  const enOferta =
    producto.precioOferta && producto.precioOferta > 0 && producto.precioOferta < producto.precio;

  const descuento = enOferta
    ? Math.round(((producto.precio - producto.precioOferta) / producto.precio) * 100)
    : 0;

  const handleAgregar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        _id: producto._id,
        nombre: producto.nombre,
        precio: precioFinal,
        imagen: producto.imagenes?.[0] || producto.imagen,
      },
      1
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative bg-dark-800 border border-neon-cyan/20 rounded-xl overflow-hidden hover:border-neon-cyan hover:shadow-neon-cyan transition-all duration-300"
    >
      <Link to={`/producto/${producto._id}`} className="block">

        {/* IMAGEN */}
        <div className="relative aspect-square overflow-hidden bg-dark-700">
          <img
            src={producto.imagenes?.[0] || producto.imagen || ''}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {               e.currentTarget.style.display = 'none';             }}
          />

          {/* Badge categoría */}
          {producto.categoria?.nombre && (
            <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-display uppercase tracking-widest bg-dark-900/80 border border-neon-cyan/50 text-neon-cyan rounded">
              {producto.categoria.nombre}
            </span>
          )}

          {/* Badge descuento */}
          {enOferta && (
            <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-display font-bold bg-neon-pink text-black rounded shadow-neon-pink">
              -{descuento}%
            </span>
          )}

          {/* Badge personalizado */}
          {producto.personalizado && (
            <span className="absolute bottom-3 left-3 px-2 py-1 text-[10px] font-display uppercase tracking-widest bg-neon-purple/80 text-white rounded">
              Personalizado
            </span>
          )}
        </div>

        {/* INFO */}
        <div className="p-4">
          <h3 className="font-display text-sm font-bold text-white line-clamp-2 min-h-[2.5rem] group-hover:text-neon-cyan transition">
            {producto.nombre}
          </h3>

          {/* Rating (si existe) */}
          {producto.rating && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-3 h-3 fill-neon-yellow text-neon-yellow" />
              <span className="text-xs text-gray-400">{producto.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Precio */}
          <div className="flex items-end gap-2 mt-3">
            <span className="font-display text-xl font-black text-neon-green text-glow-green">
              ${precioFinal.toFixed(2)}
            </span>
            {enOferta && (
              <span className="text-xs text-gray-500 line-through mb-1">
                ${producto.precio.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* BOTÓN AGREGAR */}
      <button
        onClick={handleAgregar}
        className="absolute bottom-4 right-4 p-2.5 rounded-full bg-neon-cyan text-black hover:bg-neon-pink hover:text-white transition-all shadow-neon-cyan hover:shadow-neon-pink"
        aria-label="Agregar al carrito"
        title="Agregar al carrito"
      >
        <ShoppingCart className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default ProductCard;