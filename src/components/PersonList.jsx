import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, Database, Search, Filter, X, ThumbsUp } from 'lucide-react';
import { getPersons } from '../firebase/persons';
import { seedDatabase } from '../utils/seedData';
import { useDialog } from '../contexts/DialogContext';
import ShieldButton from './ShieldButton';

const PersonList = () => {
  const { showAlert, showConfirm } = useDialog();
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPais, setSelectedPais] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

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

  const handleSeedData = async () => {
    const confirmed = await showConfirm(
      '¿Agregar 10 ladys de prueba a la base de datos?',
      'Confirmar Datos de Prueba'
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      setSeeding(true);
      await seedDatabase();
      await showAlert('10 ladys de prueba agregadas exitosamente!', 'Éxito', 'success');
      await loadPersons(); // Recargar la lista
    } catch (error) {
      console.error('Error:', error);
      await showAlert('Error al agregar datos de prueba', 'Error', 'error');
    } finally {
      setSeeding(false);
    }
  };

  // Obtener países y ciudades únicos para los filtros
  const uniquePaises = useMemo(() => {
    const paises = [...new Set(persons.map(p => p.pais))].sort();
    return paises;
  }, [persons]);

  const uniqueCiudades = useMemo(() => {
    const ciudades = [...new Set(persons.map(p => p.ciudad))].sort();
    return ciudades;
  }, [persons]);

  // Filtrar personas
  const filteredPersons = useMemo(() => {
    return persons.filter(person => {
      const matchesSearch = searchTerm === '' || 
        `${person.nombre} ${person.apellido}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPais = selectedPais === '' || person.pais === selectedPais;
      
      const matchesCiudad = selectedCiudad === '' || person.ciudad === selectedCiudad;
      
      return matchesSearch && matchesPais && matchesCiudad;
    });
  }, [persons, searchTerm, selectedPais, selectedCiudad]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPais('');
    setSelectedCiudad('');
  };

  const hasActiveFilters = searchTerm !== '' || selectedPais !== '' || selectedCiudad !== '';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

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

      {/* Buscador y Filtros */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-md mx-4 md:mx-6 lg:mx-8 mt-4 rounded-2xl shadow-lg p-3 md:p-4 border border-palette-lavender/20 max-w-7xl mx-auto lg:mx-auto"
      >
        <div className="flex items-center gap-2">
          {/* Buscador */}
          {searchOpen ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="relative flex-1"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-palette-graphite/60" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-8 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchTerm('');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-palette-graphite/60 hover:text-palette-graphite"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              onClick={() => setSearchOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-palette-lavender transition"
            >
              <Search className="w-4 h-4 text-palette-graphite/60" />
            </motion.button>
          )}

          {/* Filtros */}
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <select
                value={selectedPais}
                onChange={(e) => setSelectedPais(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition appearance-none bg-white text-palette-graphite"
              >
                <option value="">País</option>
                {uniquePaises.map(pais => (
                  <option key={pais} value={pais}>{pais}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1">
              <select
                value={selectedCiudad}
                onChange={(e) => setSelectedCiudad(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition appearance-none bg-white text-palette-graphite"
              >
                <option value="">Ciudad</option>
                {uniqueCiudades.map(ciudad => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Botón limpiar filtros y contador */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
            <motion.button
              onClick={clearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-palette-lavender/20 hover:bg-palette-lavender/30 text-palette-graphite rounded-lg transition text-sm font-medium"
            >
              <X className="w-4 h-4" />
              <span>Limpiar filtros</span>
            </motion.button>
            <p className="text-sm text-palette-graphite/60">
              {filteredPersons.length} {filteredPersons.length === 1 ? 'lady' : 'ladys'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Lista de personas */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-4 md:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPersons.length === 0 && persons.length > 0 ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-24 h-24 mx-auto text-palette-graphite/40 mb-4" />
            <p className="text-palette-graphite/80 text-lg">No se encontraron resultados</p>
            <p className="text-palette-graphite/60 text-sm mt-2">Intenta con otros filtros</p>
          </motion.div>
        ) : filteredPersons.length === 0 ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <User className="w-24 h-24 mx-auto text-palette-graphite/40 mb-4" />
            <p className="text-palette-graphite/80 text-lg">No hay ladys registradas</p>
            <p className="text-palette-graphite/60 text-sm mt-2 mb-6">Agrega la primera lady</p>
            <motion.button
              onClick={handleSeedData}
              disabled={seeding}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-palette-lavender to-palette-quartz text-palette-graphite px-6 py-3 rounded-xl font-medium shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seeding ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-palette-graphite border-t-transparent rounded-full"
                  />
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  <span>Agregar 10 Ladys de Prueba</span>
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          filteredPersons.map((person, index) => (
            <motion.div
              key={person.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={`/person/${person.id}`}>
                <div className="bg-palette-pearl backdrop-blur-md rounded-xl shadow-lg p-3 flex items-center gap-3 overflow-hidden relative group border border-palette-lavender/30">
                  {/* Imagen de perfil */}
                  <div className="relative flex-shrink-0 w-full md:w-auto lg:w-full flex justify-center">
                    <motion.div
                      className="w-20 h-20 md:w-16 md:h-16 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-gradient-to-br from-palette-lavender via-palette-quartz to-palette-gold flex items-center justify-center border-2 border-palette-pearl"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {person.fotos && person.fotos.length > 0 ? (
                        <img
                          src={person.fotos[0]}
                          alt={`${person.nombre} ${person.apellido}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 md:w-8 md:h-8 lg:w-12 lg:h-12 text-palette-graphite" />
                      )}
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    />
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0 w-full md:w-auto lg:w-full text-center md:text-left lg:text-center">
                    <div className="flex items-center justify-center md:justify-start lg:justify-center gap-2 flex-wrap">
                      <h2 className="text-base md:text-lg lg:text-xl font-display font-bold text-gray-800 truncate w-full md:w-auto">
                        {person.nombre} {person.apellido}
                      </h2>
                      {/* Contador de votos */}
                      {(person.conocidaSi > 0 || person.conocidaNo > 0) && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">{person.conocidaSi || 0}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-gray-600">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs truncate">
                        {person.ciudad}, {person.pais}
                      </span>
                    </div>
                    {person.fotos && person.fotos.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {person.fotos.length} foto{person.fotos.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Indicador de hover */}
                  <motion.div
                    className="absolute right-3 text-palette-gold font-bold text-lg"
                    initial={{ x: 20, opacity: 0 }}
                    whileHover={{ x: 0, opacity: 1 }}
                  >
                    →
                  </motion.div>

                  {/* Efecto de brillo al pasar el mouse */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </Link>
            </motion.div>
          ))
        )}
        </div>
      </motion.div>

    </div>
  );
};

export default PersonList;

