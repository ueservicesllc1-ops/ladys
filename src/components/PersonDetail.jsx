import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, CheckCircle, X, ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react';
import { getPersonById, votePerson } from '../firebase/persons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import ShieldButton from './ShieldButton';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthorizedUser } = useAuth();
  const { showAlert, showConfirm } = useDialog();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [approving, setApproving] = useState(false);
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState(null); // 'si' o 'no' o null
  
  // Verificar si viene del admin panel y si la persona está pendiente
  const isFromAdmin = location.state?.fromAdmin || false;
  const isPending = person?.approved === false;
  const showAdminActions = isFromAdmin && isPending && isAuthorizedUser();

  useEffect(() => {
    loadPerson();
    // Verificar si el usuario ya votó
    if (id) {
      const savedVote = localStorage.getItem(`vote_${id}`);
      if (savedVote) {
        setUserVote(savedVote);
      }
    }
  }, [id]);

  const loadPerson = async () => {
    try {
      setLoading(true);
      const data = await getPersonById(id);
      // Asegurar que los contadores de votos existan
      setPerson({
        ...data,
        conocidaSi: data.conocidaSi || 0,
        conocidaNo: data.conocidaNo || 0,
      });
    } catch (error) {
      console.error('Error cargando persona:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const confirmed = await showConfirm(
      `¿Estás seguro de aprobar a ${person.nombre} ${person.apellido}?`,
      'Confirmar Aprobación'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      setApproving(true);
      const personRef = doc(db, 'persons', id);
      await updateDoc(personRef, {
        approved: true
      });
      await showAlert('Lady aprobada exitosamente', 'Éxito', 'success');
      // Volver al admin panel
      navigate('/admin', { state: { showPending: true } });
    } catch (error) {
      console.error('Error aprobando persona:', error);
      await showAlert('Error al aprobar la lady', 'Error', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleClose = () => {
    navigate('/admin', { state: { showPending: true } });
  };

  const handleVote = async (vote) => {
    if (voting || userVote) return; // Ya votó o está votando
    
    try {
      setVoting(true);
      await votePerson(id, vote);
      setUserVote(vote);
      localStorage.setItem(`vote_${id}`, vote);
      
      // Actualizar el estado local
      setPerson({
        ...person,
        conocidaSi: vote === 'si' ? (person.conocidaSi || 0) + 1 : (person.conocidaSi || 0),
        conocidaNo: vote === 'no' ? (person.conocidaNo || 0) + 1 : (person.conocidaNo || 0),
      });
    } catch (error) {
      console.error('Error votando:', error);
      await showAlert('Error al registrar tu voto. Intenta de nuevo.', 'Error', 'error');
    } finally {
      setVoting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-palette-graphite text-xl">Lady no encontrada</p>
      </div>
    );
  }

  const fotos = person.fotos || [];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full bg-palette-gold/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-palette-quartz/40 relative"
      >
        <div className="w-full relative">
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            className="w-full h-auto object-cover"
            style={{ maxHeight: '120px' }}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 w-10 h-10 bg-palette-pearl/90 rounded-full flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-palette-graphite" />
          </motion.button>
        </div>
        <ShieldButton />
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        {/* Foto principal */}
        {fotos.length > 0 ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mb-6 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="aspect-[4/5] relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedPhoto}
                  src={fotos[selectedPhoto]}
                  alt={`${person.nombre} ${person.apellido} - Foto ${selectedPhoto + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              
              {/* Indicadores de foto */}
              {fotos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {fotos.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedPhoto(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === selectedPhoto ? 'bg-palette-gold' : 'bg-palette-pearl/50'
                      }`}
                      whileHover={{ scale: 1.5 }}
                      whileTap={{ scale: 0.8 }}
                    />
                  ))}
                </div>
              )}

              {/* Botones de navegación */}
              {fotos.length > 1 && (
                <>
                  <motion.button
                    onClick={() => setSelectedPhoto((prev) => (prev - 1 + fotos.length) % fotos.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-palette-pearl/80 backdrop-blur-md rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft className="w-6 h-6 text-palette-graphite" />
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedPhoto((prev) => (prev + 1) % fotos.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft className="w-6 h-6 text-white rotate-180" />
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/20 backdrop-blur-md rounded-2xl p-12 mb-6 text-center"
          >
            <p className="text-palette-graphite/80">No hay fotos disponibles</p>
          </motion.div>
        )}

        {/* Información */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-palette-pearl backdrop-blur-md rounded-2xl shadow-xl p-6 mb-4 border border-palette-quartz/30"
        >
          <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">
            {person.nombre} {person.apellido}
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-palette-lavender to-palette-quartz flex items-center justify-center">
                <MapPin className="w-5 h-5 text-palette-pearl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ubicación</p>
                <p className="text-gray-800 font-medium">
                  {person.ciudad}, {person.pais}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sección de Votación */}
        {!showAdminActions && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl shadow-xl p-4 mb-4 border border-palette-lavender/20"
          >
            <h3 className="text-lg font-display font-bold text-palette-graphite mb-3 text-center">
              ¿Conoces a esta lady?
            </h3>
            
            <div className="flex items-center justify-center gap-3">
              {/* Botón Sí */}
              <motion.button
                onClick={() => handleVote('si')}
                disabled={voting || userVote !== null}
                whileHover={!voting && !userVote ? { scale: 1.05 } : {}}
                whileTap={!voting && !userVote ? { scale: 0.95 } : {}}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-lg font-medium transition ${
                  userVote === 'si'
                    ? 'bg-green-500 text-white'
                    : userVote === 'no'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsUp className={`w-5 h-5 ${userVote === 'si' ? 'text-white' : 'text-green-600'}`} />
                <span className="text-sm font-semibold">Sí</span>
                {person.conocidaSi > 0 && (
                  <span className="text-xs font-medium opacity-80">({person.conocidaSi || 0})</span>
                )}
              </motion.button>

              {/* Botón No */}
              <motion.button
                onClick={() => handleVote('no')}
                disabled={voting || userVote !== null}
                whileHover={!voting && !userVote ? { scale: 1.05 } : {}}
                whileTap={!voting && !userVote ? { scale: 0.95 } : {}}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-lg font-medium transition ${
                  userVote === 'no'
                    ? 'bg-red-500 text-white'
                    : userVote === 'si'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsDown className={`w-5 h-5 ${userVote === 'no' ? 'text-white' : 'text-red-600'}`} />
                <span className="text-sm font-semibold">No</span>
                {person.conocidaNo > 0 && (
                  <span className="text-xs font-medium opacity-80">({person.conocidaNo || 0})</span>
                )}
              </motion.button>
            </div>

            {userVote && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-palette-graphite/70 text-sm mt-3"
              >
                {userVote === 'si' ? '✓ Votaste: Sí' : '✓ Votaste: No'}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Historia */}
        {person.historia && person.historia.trim() !== '' && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-palette-pearl backdrop-blur-md rounded-2xl shadow-xl p-6 border border-palette-lavender/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-palette-lavender to-palette-quartz flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-palette-pearl" />
              </div>
              <h3 className="text-lg font-display font-bold text-gray-800">Su Historia</h3>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {person.historia}
            </p>
          </motion.div>
        )}

        {/* Miniaturas de fotos */}
        {fotos.length > 1 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <h3 className="text-lg font-display font-bold text-palette-graphite mb-3">Todas las fotos</h3>
            <div className="grid grid-cols-3 gap-2">
              {fotos.map((foto, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedPhoto(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                    className={`aspect-square rounded-xl overflow-hidden ${
                    index === selectedPhoto ? 'ring-4 ring-palette-gold' : ''
                  }`}
                >
                  <img
                    src={foto}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Botones de administrador para aprobar */}
        {showAdminActions && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 bg-gradient-to-r from-palette-lavender via-palette-quartz to-palette-gold rounded-2xl p-6 border border-palette-gold/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">
                  Pendiente de Aprobación
                </h3>
                <p className="text-sm text-white/80">
                  Esta lady está esperando tu aprobación
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                onClick={handleApprove}
                disabled={approving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-white text-palette-graphite py-3 px-6 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {approving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-palette-graphite border-t-transparent rounded-full"
                    />
                    Aprobando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Aprobar
                  </>
                )}
              </motion.button>
              
              <motion.button
                onClick={handleClose}
                disabled={approving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                Cerrar
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PersonDetail;

