import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Database, Search, Filter, X, ThumbsUp, ThumbsDown, ArrowLeft, BookOpen } from 'lucide-react';
import { getPersons, getPersonById, votePerson } from '../firebase/persons';
import { seedDatabase } from '../utils/seedData';
import { useDialog } from '../contexts/DialogContext';
import { useAuth } from '../contexts/AuthContext';
import ShieldButton from './ShieldButton';

// Provincias y ciudades de Ecuador (lista completa)
const provinciasEcuador = {
  'Azuay': ['Cuenca', 'Gualaceo', 'Paute', 'Sigsig', 'Girón', 'San Fernando', 'Santa Isabel', 'Pucará', 'El Pan', 'Sevilla de Oro', 'Chordeleg', 'Oña', 'Nabón', 'Ponce Enríquez', 'Camposano', 'Camilo Ponce Enríquez'],
  'Bolívar': ['Guaranda', 'San Miguel', 'Caluma', 'Chillanes', 'Chimbo', 'Echeandía', 'Las Naves', 'Salinas'],
  'Cañar': ['Azogues', 'Biblián', 'Cañar', 'La Troncal', 'El Tambo', 'Déleg', 'Suscal'],
  'Carchi': ['Tulcán', 'Mira', 'Espejo', 'Montúfar', 'San Pedro de Huaca', 'Huaca', 'San Gabriel', 'El Ángel', 'Julio Andrade'],
  'Chimborazo': ['Riobamba', 'Alausí', 'Colta', 'Chambo', 'Chunchi', 'Guamote', 'Guano', 'Pallatanga', 'Penipe', 'Cumandá', 'Unión'],
  'Cotopaxi': ['Latacunga', 'La Maná', 'Pangua', 'Pujilí', 'Salcedo', 'Saquisilí', 'Sigchos', 'Valencia'],
  'El Oro': ['Machala', 'Arenillas', 'Atahualpa', 'Balsas', 'Chilla', 'El Guabo', 'Huaquillas', 'Marcabelí', 'Pasaje', 'Piñas', 'Portovelo', 'Santa Rosa', 'Zaruma'],
  'Esmeraldas': ['Esmeraldas', 'Atacames', 'Eloy Alfaro', 'Muisne', 'Quinindé', 'Rosa Zárate', 'San Lorenzo', 'Valdez'],
  'Galápagos': ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'],
  'Guayas': ['Guayaquil', 'Daule', 'Durán', 'El Triunfo', 'Milagro', 'Naranjal', 'Naranjito', 'Palestina', 'Pedro Carbo', 'Samborondón', 'Santa Lucía', 'Salitre', 'San Jacinto de Yaguachi', 'Playas', 'Simón Bolívar', 'Yaguachi', 'Alfredo Baquerizo Moreno', 'Balao', 'Balzar', 'Colimes', 'Coronel Marcelino Maridueña', 'El Empalme', 'General Antonio Elizalde', 'Isidro Ayora', 'Lomas de Sargentillo', 'Marcos', 'Nobol'],
  'Imbabura': ['Ibarra', 'Antonio Ante', 'Cotacachi', 'Otavalo', 'Pimampiro', 'San Miguel de Urcuquí', 'Atuntaqui', 'Urcuquí'],
  'Loja': ['Loja', 'Calvas', 'Catamayo', 'Celica', 'Chaguarpamba', 'Espíndola', 'Gonzanamá', 'Macará', 'Olmedo', 'Paltas', 'Pindal', 'Puyango', 'Quilanga', 'Saraguro', 'Sozoranga', 'Zapotillo', 'Cariamanga'],
  'Los Ríos': ['Babahoyo', 'Baba', 'Montalvo', 'Puebloviejo', 'Quevedo', 'Urdaneta', 'Ventanas', 'Vinces', 'Palenque', 'Buena Fe', 'Valencia', 'Mocache', 'Quinsaloma'],
  'Manabí': ['Portoviejo', 'Bolívar', 'Chone', 'El Carmen', 'Flavio Alfaro', 'Jipijapa', 'Junín', 'Manta', 'Montecristi', 'Paján', 'Pedernales', 'Pichincha', 'Puerto López', 'Rocafuerte', 'Santa Ana', 'Sucre', 'Tosagua', 'Veinticuatro de Mayo', 'Jaramijó', 'San Vicente', 'Bahía de Caráquez', 'Calceta', 'Charapotó', 'Crucita'],
  'Morona Santiago': ['Macas', 'Gualaquiza', 'Huamboya', 'Limón Indanza', 'Logroño', 'Morona', 'Pablo Sexto', 'Palora', 'San Juan Bosco', 'Santiago', 'Sucúa', 'Taisha', 'Tiwintza'],
  'Napo': ['Tena', 'Archidona', 'El Chaco', 'Quijos', 'Carlos Julio Arosemena Tola', 'Baeza'],
  'Orellana': ['Francisco de Orellana', 'Aguarico', 'La Joya de los Sachas', 'Loreto'],
  'Pastaza': ['Puyo', 'Arajuno', 'Mera', 'Santa Clara'],
  'Pichincha': ['Quito', 'Cayambe', 'Mejía', 'Pedro Moncayo', 'Rumiñahui', 'San Miguel de Los Bancos', 'Pedro Vicente Maldonado', 'Puerto Quito', 'Distrito Metropolitano de Quito', 'Machachi', 'Sangolquí', 'Tabacundo', 'San Antonio de Pichincha'],
  'Santa Elena': ['Santa Elena', 'La Libertad', 'Salinas', 'Ballenita'],
  'Santo Domingo de los Tsáchilas': ['Santo Domingo', 'La Concordia'],
  'Sucumbíos': ['Nueva Loja', 'Cascales', 'Cuyabeno', 'Gonzalo Pizarro', 'Lago Agrio', 'Putumayo', 'Shushufindi', 'Sucumbíos'],
  'Tungurahua': ['Ambato', 'Baños de Agua Santa', 'Cevallos', 'Mocha', 'Patate', 'Quero', 'San Pedro de Pelileo', 'Santiago de Píllaro', 'Tisaleo'],
  'Zamora Chinchipe': ['Zamora', 'Chinchipe', 'El Pangui', 'Nangaritza', 'Palanda', 'Paquisha', 'Yacuambi', 'Yantzaza', 'Centinela del Cóndor', 'Zumbi'],
};

const PersonList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlert, showConfirm } = useDialog();
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    loadPersons();
    
    // Detectar si es desktop
    const checkDesktop = () => {
      const isDesktopWidth = window.innerWidth >= 1024;
      setIsDesktop(isDesktopWidth);
      console.log('Desktop detection:', isDesktopWidth, 'Width:', window.innerWidth);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
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

  // Obtener provincias disponibles (todas las de Ecuador)
  const provinciasDisponibles = useMemo(() => {
    return Object.keys(provinciasEcuador).sort();
  }, []);

  // Obtener ciudades según la provincia seleccionada
  const ciudadesDisponibles = useMemo(() => {
    if (!selectedProvincia) {
      return [];
    }
    return provinciasEcuador[selectedProvincia] || [];
  }, [selectedProvincia]);

  // Filtrar personas
  const filteredPersons = useMemo(() => {
    return persons.filter(person => {
      const matchesSearch = searchTerm === '' || 
        `${person.nombre} ${person.apellido}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Si hay provincia seleccionada, verificar que la ciudad pertenezca a esa provincia
      let matchesProvincia = true;
      if (selectedProvincia) {
        const ciudadesProvincia = provinciasEcuador[selectedProvincia] || [];
        matchesProvincia = ciudadesProvincia.includes(person.ciudad);
      }
      
      const matchesCiudad = selectedCiudad === '' || person.ciudad === selectedCiudad;
      
      return matchesSearch && matchesProvincia && matchesCiudad;
    });
  }, [persons, searchTerm, selectedProvincia, selectedCiudad]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProvincia('');
    setSelectedCiudad('');
  };

  const hasActiveFilters = searchTerm !== '' || selectedProvincia !== '' || selectedCiudad !== '';

  // Resetear ciudad cuando cambia la provincia
  useEffect(() => {
    if (selectedProvincia) {
      setSelectedCiudad('');
    }
  }, [selectedProvincia]);

  // Cargar persona para el modal
  const handlePersonClick = async (personId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('handlePersonClick called, isDesktop:', isDesktop, 'personId:', personId);
    if (!isDesktop) {
      // En móvil, dejar que el Link maneje la navegación
      return;
    }
    setModalLoading(true);
    setSelectedPhoto(0);
    try {
      const personData = await getPersonById(personId);
      console.log('Person data loaded:', personData);
      setSelectedPerson({
        ...personData,
        conocidaSi: personData.conocidaSi || 0,
        conocidaNo: personData.conocidaNo || 0,
      });
      // Verificar si el usuario ya votó
      const savedVote = localStorage.getItem(`vote_${personId}`);
      if (savedVote) {
        setUserVote(savedVote);
      } else {
        setUserVote(null);
      }
    } catch (error) {
      console.error('Error cargando persona:', error);
      showAlert('Error al cargar los detalles', 'Error', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!selectedPerson || !user) return;
    
    try {
      setVoting(true);
      await votePerson(selectedPerson.id, voteType);
      
      // Actualizar estado local
      setSelectedPerson(prev => ({
        ...prev,
        conocidaSi: voteType === 'si' ? (prev.conocidaSi || 0) + 1 : prev.conocidaSi || 0,
        conocidaNo: voteType === 'no' ? (prev.conocidaNo || 0) + 1 : prev.conocidaNo || 0,
      }));
      
      // Guardar voto en localStorage
      localStorage.setItem(`vote_${selectedPerson.id}`, voteType);
      setUserVote(voteType);
      
      // Actualizar en la lista principal
      setPersons(prev => prev.map(p => 
        p.id === selectedPerson.id 
          ? { ...p, conocidaSi: voteType === 'si' ? (p.conocidaSi || 0) + 1 : p.conocidaSi || 0, conocidaNo: voteType === 'no' ? (p.conocidaNo || 0) + 1 : p.conocidaNo || 0 }
          : p
      ));
    } catch (error) {
      console.error('Error votando:', error);
      showAlert('Error al votar', 'Error', 'error');
    } finally {
      setVoting(false);
    }
  };

  const closeModal = () => {
    setSelectedPerson(null);
    setSelectedPhoto(0);
    setUserVote(null);
  };

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
        className="w-full bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200 relative"
      >
        <div className="w-full flex justify-center items-center py-2 md:py-1">
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            className="h-auto object-contain max-h-[200px] md:max-h-[100px] lg:max-h-[90px]"
            style={{ width: 'auto' }}
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
                value={selectedProvincia}
                onChange={(e) => setSelectedProvincia(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition appearance-none bg-white text-palette-graphite"
              >
                <option value="">Provincia</option>
                {provinciasDisponibles.map(provincia => (
                  <option key={provincia} value={provincia}>{provincia}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1">
              <select
                value={selectedCiudad}
                onChange={(e) => setSelectedCiudad(e.target.value)}
                disabled={!selectedProvincia}
                className={`w-full px-3 py-2 text-sm rounded-lg border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition appearance-none bg-white text-palette-graphite ${
                  !selectedProvincia ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Ciudad</option>
                {ciudadesDisponibles.map(ciudad => (
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
              {isDesktop ? (
                <div 
                  className="h-full block cursor-pointer"
                  onClick={(e) => handlePersonClick(person.id, e)}
                >
                  <div className="bg-palette-pearl backdrop-blur-md rounded-xl shadow-lg p-3 md:p-4 flex items-center md:flex-col md:items-center gap-3 overflow-hidden relative group border border-palette-lavender/30 h-full transition-all hover:shadow-xl">
                  {/* Imagen de perfil */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-gradient-to-br from-palette-lavender via-palette-quartz to-palette-gold flex items-center justify-center border-2 border-palette-pearl"
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
                        <User className="w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 text-palette-graphite" />
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
                  <div className="flex-1 min-w-0 md:w-full md:text-center">
                    <div className="flex items-center gap-2 flex-wrap md:justify-center">
                      <h2 className="text-lg font-display font-bold text-gray-800 truncate md:truncate-none">
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
                    <div className="flex items-center gap-1.5 mt-0.5 text-gray-600 md:justify-center">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs md:text-sm truncate md:truncate-none">
                        {person.ciudad}, {person.pais}
                      </span>
                    </div>
                    {person.fotos && person.fotos.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5 md:mt-1">
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
                </div>
              ) : (
                <Link to={`/person/${person.id}`} className="h-full block">
                  <div className="bg-palette-pearl backdrop-blur-md rounded-xl shadow-lg p-3 md:p-4 flex items-center md:flex-col md:items-center gap-3 overflow-hidden relative group border border-palette-lavender/30 h-full transition-all hover:shadow-xl">
                  {/* Imagen de perfil */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-gradient-to-br from-palette-lavender via-palette-quartz to-palette-gold flex items-center justify-center border-2 border-palette-pearl"
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
                        <User className="w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 text-palette-graphite" />
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
                  <div className="flex-1 min-w-0 md:w-full md:text-center">
                    <div className="flex items-center gap-2 flex-wrap md:justify-center">
                      <h2 className="text-lg font-display font-bold text-gray-800 truncate md:truncate-none">
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
                    <div className="flex items-center gap-1.5 mt-0.5 text-gray-600 md:justify-center">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs md:text-sm truncate md:truncate-none">
                        {person.ciudad}, {person.pais}
                      </span>
                    </div>
                    {person.fotos && person.fotos.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5 md:mt-1">
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
              )}
            </motion.div>
          ))
        )}
        </div>
      </motion.div>

      {/* Modal para Desktop */}
      <AnimatePresence>
        {isDesktop && selectedPerson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {modalLoading ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-palette-lavender border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <div className="p-6">
                  {/* Header del modal */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-display font-bold text-gray-800">
                      {selectedPerson.nombre} {selectedPerson.apellido}
                    </h2>
                    <motion.button
                      onClick={closeModal}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>

                  {/* Fotos - Carrusel */}
                  {selectedPerson.fotos && selectedPerson.fotos.length > 0 ? (
                    <div className="relative mb-6 rounded-xl overflow-hidden">
                      <div className="w-full max-w-xs mx-auto aspect-[4/5] relative bg-gray-100 rounded-xl overflow-hidden">
                        <motion.img
                          key={selectedPhoto}
                          src={selectedPerson.fotos[selectedPhoto]}
                          alt={`${selectedPerson.nombre} - Foto ${selectedPhoto + 1}`}
                          className="w-full h-full object-cover"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        />
                        
                        {/* Carrusel - Solo si hay más de una foto */}
                        {selectedPerson.fotos.length > 1 && (
                          <>
                            {/* Botón Anterior */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPhoto((prev) => (prev - 1 + selectedPerson.fotos.length) % selectedPerson.fotos.length);
                              }}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl z-10 transition"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ArrowLeft className="w-6 h-6 text-white" />
                            </motion.button>
                            
                            {/* Botón Siguiente */}
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPhoto((prev) => (prev + 1) % selectedPerson.fotos.length);
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl z-10 transition"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ArrowLeft className="w-6 h-6 text-white rotate-180" />
                            </motion.button>
                            
                            {/* Indicadores de fotos */}
                            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                              {selectedPerson.fotos.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPhoto(index);
                                  }}
                                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                                    index === selectedPhoto 
                                      ? 'bg-white w-6' 
                                      : 'bg-white/50 hover:bg-white/75'
                                  }`}
                                />
                              ))}
                            </div>
                            
                            {/* Contador de fotos */}
                            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                              {selectedPhoto + 1} / {selectedPerson.fotos.length}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-xl p-12 mb-6 text-center">
                      <User className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No hay fotos disponibles</p>
                    </div>
                  )}

                  {/* Información */}
                  <div className="bg-palette-pearl rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-palette-lavender to-palette-quartz flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ubicación</p>
                        <p className="text-gray-800 font-medium">
                          {selectedPerson.ciudad}, {selectedPerson.pais}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Votación */}
                  {user && (
                    <div className="bg-white rounded-xl p-3 mb-4 border border-palette-lavender/20">
                      <h3 className="text-sm font-display font-bold text-palette-graphite mb-2 text-center">
                        ¿Conoces a esta lady?
                      </h3>
                      
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          onClick={() => handleVote('si')}
                          disabled={voting || userVote !== null}
                          whileHover={!voting && !userVote ? { scale: 1.05 } : {}}
                          whileTap={!voting && !userVote ? { scale: 0.95 } : {}}
                          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg font-medium transition ${
                            userVote === 'si'
                              ? 'bg-green-500 text-white'
                              : userVote === 'no'
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-green-100 hover:bg-green-200 text-green-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${userVote === 'si' ? 'text-white' : 'text-green-600'}`} />
                          <span className="text-xs font-semibold">Sí</span>
                          {selectedPerson.conocidaSi > 0 && (
                            <span className="text-[10px] font-medium opacity-80">({selectedPerson.conocidaSi || 0})</span>
                          )}
                        </motion.button>

                        <motion.button
                          onClick={() => handleVote('no')}
                          disabled={voting || userVote !== null}
                          whileHover={!voting && !userVote ? { scale: 1.05 } : {}}
                          whileTap={!voting && !userVote ? { scale: 0.95 } : {}}
                          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg font-medium transition ${
                            userVote === 'no'
                              ? 'bg-red-500 text-white'
                              : userVote === 'si'
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-red-100 hover:bg-red-200 text-red-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <ThumbsDown className={`w-4 h-4 ${userVote === 'no' ? 'text-white' : 'text-red-600'}`} />
                          <span className="text-xs font-semibold">No</span>
                          {selectedPerson.conocidaNo > 0 && (
                            <span className="text-[10px] font-medium opacity-80">({selectedPerson.conocidaNo || 0})</span>
                          )}
                        </motion.button>
                      </div>
                      
                      {userVote && (
                        <p className="text-center text-palette-graphite/70 text-xs mt-2">
                          {userVote === 'si' ? '✓ Votaste: Sí' : '✓ Votaste: No'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Historia */}
                  {selectedPerson.historia && selectedPerson.historia.trim() !== '' && (
                    <div className="bg-palette-pearl rounded-xl p-4 border border-palette-lavender/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-palette-lavender to-palette-quartz flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-gray-800">Su Historia</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedPerson.historia}
                      </p>
                    </div>
                  )}

                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PersonList;

