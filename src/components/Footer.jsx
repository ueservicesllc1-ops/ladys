import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Grid3x3, Plus } from 'lucide-react';

const Footer = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/person/');
    }
    return location.pathname === path;
  };

  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white backdrop-blur-lg border-t border-palette-lavender/30 shadow-2xl z-50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {/* Botón Inicio */}
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive('/')
                  ? 'text-palette-lavender'
                  : 'text-palette-graphite/60'
              }`}
            >
              <Home className={`w-6 h-6 ${isActive('/') ? 'text-palette-lavender' : 'text-palette-graphite/60'}`} />
              <span className="text-xs font-medium font-display">Inicio</span>
            </motion.button>
          </Link>

          {/* Botón + (Agregar) */}
          <Link to="/add">
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-2 transition-all ${
                isActive('/add')
                  ? 'bg-gradient-to-br from-palette-lavender via-palette-quartz to-palette-gold border-palette-gold'
                  : 'bg-gradient-to-br from-palette-lavender via-palette-quartz to-palette-gold border-palette-pearl'
              }`}
            >
              <Plus className="w-8 h-8 text-palette-graphite" />
            </motion.button>
          </Link>

          {/* Botón Galería */}
          <Link to="/gallery">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive('/gallery')
                  ? 'text-palette-lavender'
                  : 'text-palette-graphite/60'
              }`}
            >
              <Grid3x3 className={`w-6 h-6 ${isActive('/gallery') ? 'text-palette-lavender' : 'text-palette-graphite/60'}`} />
              <span className="text-xs font-medium font-display">Galería</span>
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;

