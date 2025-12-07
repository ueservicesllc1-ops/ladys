import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, Check } from 'lucide-react';
import { addPerson, uploadPhotos } from '../firebase/persons';
import { useDialog } from '../contexts/DialogContext';
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

const AddPersonForm = () => {
  const navigate = useNavigate();
  const { showAlert } = useDialog();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    pais: 'Ecuador', // Fijo
    provincia: '',
    ciudad: '',
    historia: '',
  });
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'provincia') {
      // Cuando cambia la provincia, limpiar ciudad
      setFormData({
        ...formData,
        provincia: value,
        ciudad: '', // Limpiar ciudad cuando cambia la provincia
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Crear previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido || !formData.provincia || !formData.ciudad) {
      await showAlert('Por favor completa todos los campos obligatorios', 'Campos Requeridos', 'warning');
      return;
    }

    if (photos.length === 0) {
      await showAlert('Por favor agrega al menos una foto', 'Fotos Requeridas', 'warning');
      return;
    }

    try {
      setLoading(true);

      // Agregar persona
      const personId = await addPerson({
        ...formData,
      });

      // Subir todas las fotos a B2
      await uploadPhotos(personId, photos);

      // Éxito
      await showAlert(
        'Bro.. esta lady será publicada en unos minutos, relájate y deja que nuestros administradores la aprueben.',
        '¡Lady Agregada!',
        'success'
      );
      navigate('/');
    } catch (error) {
      console.error('Error guardando persona:', error);
      await showAlert('Error al guardar la lady. Por favor intenta de nuevo.', 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full bg-palette-quartz/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-palette-lavender/40 relative"
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

      <form onSubmit={handleSubmit} className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-palette-pearl backdrop-blur-md rounded-2xl shadow-xl p-6 space-y-6 border border-palette-lavender/30"
        >
          {/* Campos básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition"
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition"
                placeholder="Apellido"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia *
              </label>
              <select
                name="provincia"
                value={formData.provincia}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition bg-white"
              >
                <option value="">Selecciona una provincia</option>
                {Object.keys(provinciasEcuador).map((provincia) => (
                  <option key={provincia} value={provincia}>
                    {provincia}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                required
                disabled={!formData.provincia}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed city-select"
              >
                <option value="">
                  {formData.provincia ? 'Selecciona una ciudad' : 'Primero selecciona una provincia'}
                </option>
                {formData.provincia && provinciasEcuador[formData.provincia] && provinciasEcuador[formData.provincia].map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Historia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuéntanos tu historia (Opcional)
            </label>
            <textarea
              name="historia"
              value={formData.historia}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition resize-none"
              placeholder="Comparte la historia de esta lady..."
            />
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Fotos * (Mínimo 1)
            </label>
            <div className="space-y-4">
              {/* Preview de fotos */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {photoPreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <motion.button
                        type="button"
                        onClick={() => removePhoto(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-2 right-2 w-8 h-8 bg-palette-graphite/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-palette-pearl" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Input de fotos */}
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block w-full"
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div className="w-full px-6 py-8 border-2 border-dashed border-palette-gold rounded-xl text-center cursor-pointer bg-palette-gold/20 hover:bg-palette-gold/30 transition">
                  <Upload className="w-12 h-12 mx-auto text-palette-gold mb-3" />
                  <p className="text-gray-700 font-medium">
                    Toca para agregar fotos
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Puedes seleccionar múltiples fotos
                  </p>
                </div>
              </motion.label>
            </div>
          </div>

          {/* Botón de enviar */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-palette-lavender via-palette-quartz to-palette-gold text-palette-graphite py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Guardar Lady</span>
              </>
            )}
          </motion.button>

          {/* Mensaje de privacidad */}
          <p className="text-xs text-center text-gray-500 mt-4">
            Tus datos son privados y no se verán en esta app
          </p>
        </motion.div>
      </form>
    </div>
  );
};

export default AddPersonForm;

