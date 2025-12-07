import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { getPersons } from '../firebase/persons';
import ShieldButton from './ShieldButton';

const Gallery = () => {
  const navigate = useNavigate();
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      setLoading(true);
      const data = await getPersons();
      setPersons(data);
    } catch (error) {
      console.error('Error cargando personas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener todas las fotos de todas las personas
  const allPhotos = persons.flatMap(person => 
    (person.fotos || []).map(photo => ({
      url: photo,
      personId: person.id,
      personName: `${person.nombre} ${person.apellido}`,
    }))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-palette-lavender border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full bg-palette-lavender/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-palette-quartz/40 relative"
      >
        <div className="w-full">
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            className="w-full h-auto object-cover"
            style={{ maxHeight: '120px' }}
          />
        </div>
        <ShieldButton />
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-display font-bold text-palette-graphite mb-6">
          Galería de Fotos
        </h1>

        {allPhotos.length === 0 ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-palette-graphite/80 text-lg">No hay fotos disponibles</p>
            <p className="text-palette-graphite/60 text-sm mt-2">Agrega ladys con fotos para verlas aquí</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {allPhotos.map((photo, index) => (
              <motion.div
                key={`${photo.personId}-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPhoto(photo)}
                className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-lg border-2 border-palette-lavender/20 hover:border-palette-lavender transition"
              >
                <img
                  src={photo.url}
                  alt={photo.personName}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal de foto ampliada */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.personName}
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute top-4 left-4 bg-palette-pearl/90 backdrop-blur-md rounded-lg px-4 py-2">
                <p className="text-palette-graphite font-display font-medium">
                  {selectedPhoto.personName}
                </p>
              </div>
              <motion.button
                onClick={() => setSelectedPhoto(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 w-10 h-10 bg-palette-pearl/90 backdrop-blur-md rounded-full flex items-center justify-center"
              >
                <X className="w-6 h-6 text-palette-graphite" />
              </motion.button>
              <motion.button
                onClick={() => {
                  setSelectedPhoto(null);
                  navigate(`/person/${selectedPhoto.personId}`);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-palette-lavender to-palette-quartz text-palette-graphite px-6 py-3 rounded-full font-medium shadow-lg"
              >
                Ver Perfil
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;

