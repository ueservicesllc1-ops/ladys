import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Users, Trash2, Edit, X, Bell, CheckCircle, Eye, Send, UserX, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import { getPersons } from '../firebase/persons';
import { doc, deleteDoc, updateDoc, query, where, getDocs, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAllTokens } from '../services/pushNotifications';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showAlert, showConfirm } = useDialog();
  const [persons, setPersons] = useState([]);
  const [pendingPersons, setPendingPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPending, setShowPending] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushSending, setPushSending] = useState(false);
  const [fcmTokens, setFcmTokens] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [usersCount, setUsersCount] = useState(0);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    // Solo cargar personas si el PIN está verificado
    if (pinVerified) {
      loadPersons();
      loadFcmTokens();
      loadUsersCount();
      // Actualizar contador de usuarios cada 30 segundos
      const usersCountInterval = setInterval(() => {
        loadUsersCount();
      }, 30000);
      return () => clearInterval(usersCountInterval);
    } else {
      // Si no está verificado, asegurar que no hay datos
      setPersons([]);
      setPendingPersons([]);
      setFcmTokens([]);
      setUsersCount(0);
      setLoading(false);
    }
  }, [user, navigate, pinVerified]);

  const loadFcmTokens = async () => {
    try {
      const tokens = await getAllTokens();
      setFcmTokens(tokens);
    } catch (error) {
      // Silenciar errores de permisos - no es crítico para el funcionamiento
      console.warn('No se pudieron cargar tokens FCM (puede ser por permisos):', error.message);
      setFcmTokens([]);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (pin === '1619') {
      setPinVerified(true);
      setPin('');
    } else {
      setError('PIN incorrecto');
    }
  };

  const loadPersons = async () => {
    try {
      setLoading(true);
      const data = await getPersons();
      setPersons(data);
      
      // Cargar ladys pendientes de aprobación
      const q = query(collection(db, 'persons'), where('approved', '==', false));
      const querySnapshot = await getDocs(q);
      const pending = [];
      querySnapshot.forEach((doc) => {
        pending.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setPendingPersons(pending);
    } catch (error) {
      console.error('Error cargando personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (personId) => {
    try {
      const personRef = doc(db, 'persons', personId);
      await updateDoc(personRef, {
        approved: true
      });
      await loadPersons();
      await showAlert('Lady aprobada exitosamente', 'Éxito', 'success');
    } catch (error) {
      console.error('Error aprobando persona:', error);
      await showAlert('Error al aprobar la lady', 'Error', 'error');
    }
  };

  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      await showAlert('Por favor completa el título y el mensaje', 'Información', 'warning');
      return;
    }

    if (fcmTokens.length === 0) {
      await showAlert('No hay dispositivos registrados para recibir notificaciones', 'Información', 'warning');
      return;
    }

    try {
      setPushSending(true);
      const tokens = fcmTokens.map(t => t.token);

      const response = await fetch('/api/send-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens,
          title: pushTitle,
          body: pushBody,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        await showAlert(
          `Notificación enviada: ${result.sent} exitosas, ${result.failed} fallidas`,
          'Notificación Enviada',
          'success'
        );
        setPushTitle('');
        setPushBody('');
        setShowPushModal(false);
      } else {
        await showAlert(`Error: ${result.error || 'Error desconocido'}`, 'Error', 'error');
      }
    } catch (error) {
      console.error('Error enviando push:', error);
      await showAlert('Error al enviar la notificación. Verifica que el servidor esté corriendo.', 'Error', 'error');
    } finally {
      setPushSending(false);
    }
  };

  const handleDelete = async (personId, personName) => {
    const confirmed = await showConfirm(
      `¿Estás seguro de eliminar a ${personName}?`,
      'Confirmar Eliminación'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'persons', personId));
      await loadPersons();
      await showAlert('Lady eliminada exitosamente', 'Éxito', 'success');
    } catch (error) {
      console.error('Error eliminando persona:', error);
      await showAlert('Error al eliminar la lady', 'Error', 'error');
    }
  };

  const loadUsersCount = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          if (result.success) {
            setUsersCount(result.users?.length || 0);
          }
        }
      } else {
        // Silenciar errores para no interrumpir la experiencia
        console.warn('Error cargando contador de usuarios:', response.status);
      }
    } catch (error) {
      // Silenciar errores para no interrumpir la experiencia
      console.warn('Error cargando contador de usuarios:', error.message);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      
      // Intentar hacer la petición con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      let response;
      try {
        response = await fetch('/api/users', {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('La petición tardó demasiado. El servidor puede no estar respondiendo.');
        }
        throw new Error('No se pudo conectar con el servidor. Verifica que el servidor esté corriendo.');
      }
      clearTimeout(timeoutId);
      
      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no es JSON (probablemente HTML):', text.substring(0, 200));
        throw new Error('El servidor no está respondiendo correctamente. Verifica que FIREBASE_SERVICE_ACCOUNT esté configurado en Railway.');
      }
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUsers(result.users || []);
        setUsersCount(result.users?.length || 0); // Actualizar contador también
      } else {
        const errorMsg = result.error || 'Error al cargar usuarios';
        await showAlert(`Error: ${errorMsg}`, 'Error', 'error');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      let errorMessage = 'Error al cargar usuarios. ';
      
      if (error.message.includes('FIREBASE_SERVICE_ACCOUNT') || error.message.includes('Firebase Admin')) {
        errorMessage += 'Firebase Admin SDK no está configurado. Agrega FIREBASE_SERVICE_ACCOUNT en Railway.';
      } else if (error.message.includes('conectar') || error.message.includes('servidor')) {
        errorMessage += 'No se pudo conectar con el servidor. Verifica que el servidor esté corriendo en Railway.';
      } else {
        errorMessage += 'Verifica que el servidor esté corriendo y que FIREBASE_SERVICE_ACCOUNT esté configurado.';
      }
      
      await showAlert(errorMessage, 'Error', 'error');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (uid, email) => {
    const confirmed = await showConfirm(
      `¿Estás seguro de eliminar al usuario ${email}? Esta acción no se puede deshacer.`,
      'Confirmar Eliminación'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(uid);
      const response = await fetch(`/api/users/${uid}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (response.ok) {
        await showAlert('Usuario eliminado exitosamente', 'Éxito', 'success');
        await loadUsers(); // Recargar lista
      } else {
        await showAlert(`Error: ${result.error || 'Error al eliminar usuario'}`, 'Error', 'error');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      await showAlert('Error al eliminar usuario. Verifica que el servidor esté corriendo.', 'Error', 'error');
    } finally {
      setDeletingUserId(null);
    }
  };

  const generateFakeLadys = async () => {
    const confirmed = await showConfirm(
      '¿Estás seguro de crear 10 ladys ficticias? Esto agregará datos de prueba a la base de datos.',
      'Confirmar Creación'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      setSeeding(true);

      // Lista de apellidos comunes en Ecuador
      const apellidos = [
        'Morales', 'Rodríguez', 'García', 'López', 'Fernández', 'Martínez', 'Sánchez', 'Torres', 'Vargas', 'Jiménez',
        'González', 'Pérez', 'Ramírez', 'Flores', 'Rivera', 'Castro', 'Ortiz', 'Gómez', 'Díaz', 'Herrera',
        'Mendoza', 'Ramos', 'Silva', 'Cruz', 'Vásquez', 'Moreno', 'Alvarez', 'Romero', 'Medina', 'Guerrero',
        'Rojas', 'Vega', 'Campos', 'Mora', 'Salazar', 'Villavicencio', 'Paredes', 'Espinoza', 'Cárdenas', 'Aguilar',
        'Benítez', 'Cordero', 'Delgado', 'Escobar', 'Figueroa', 'Hidalgo', 'Ibarra', 'Jaramillo', 'Lara', 'Navarro'
      ];

      // Función para obtener dos apellidos aleatorios diferentes
      const getRandomApellidos = () => {
        const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
        let apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
        // Asegurar que sean diferentes
        while (apellido2 === apellido1) {
          apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
        }
        return `${apellido1} ${apellido2}`;
      };

      const fakeLadys = [
        {
          nombre: 'Valentina',
          apellido: getRandomApellidos(),
          pais: 'Ecuador',
          provincia: 'Pichincha',
          ciudad: 'Quito',
          edad: '28',
          ocupacion: 'Diseñadora Gráfica',
          historia: 'Esta perra me engañó con su jefe durante 8 meses mientras yo trabajaba como un idiota para mantenerla. Un día que se metió a bañar, su teléfono sonó y vi los mensajes. "Te extraño mi amor", "cuando nos vemos de nuevo", fotos de ella desnuda que le mandaba a ese hijo de puta. Me destrozó. Confronté a ambos en una cena de trabajo y ella ni siquiera se disculpó, solo me dijo que yo no la satisfacía. 3 años de relación tirados a la basura por una zorra que se vendió por un ascenso.'
        },
        {
          nombre: 'Isabella',
          apellido: getRandomApellidos(),
          pais: 'Ecuador',
          provincia: 'Guayas',
          ciudad: 'Guayaquil',
          edad: '25',
          ocupacion: 'Estudiante de Medicina',
          historia: 'Mi novia de 3 años resultó ser una puta. Un amigo me mandó fotos de ella besándose con otro tipo en un bar mientras yo pensaba que estaba estudiando. Cuando la confronté, me dijo que llevaba 6 meses engañándome porque "la relación se había vuelto aburrida". Seis meses mintiéndome en la cara, durmiendo conmigo después de estar con otros. Me siento usado, traicionado. Esta mujer me hizo perder la confianza en todo.'
        },
        {
          nombre: 'Sofía',
          apellido: getRandomApellidos(),
          pais: 'Ecuador',
          provincia: 'Azuay',
          ciudad: 'Cuenca',
          edad: '32',
          ocupacion: 'Contadora',
          historia: 'Mi esposa me fue infiel durante más de un año con un compañero de trabajo. Descubrí todo cuando revisé el historial de ubicaciones de su teléfono. Los fines de semana que decía estar visitando a su familia, en realidad estaba en hoteles de mierda con ese cabrón. Lo peor es que el tipo también está casado, así que destruyó dos familias. Me siento como un idiota, un año entero siendo cornudo sin saberlo. Ella me robó mi paz, mi confianza, todo. Ahora no puedo ni dormir pensando en todas las veces que me mintió a la cara.'
        },
        {
          nombre: 'Camila',
          apellido: getRandomApellidos(),
          pais: 'Ecuador',
          provincia: 'Manabí',
          ciudad: 'Manta',
          edad: '23',
          ocupacion: 'Influencer',
          historia: 'Esta zorra me engañó con mi mejor amigo. 4 meses de relación secreta entre ellos mientras yo confiaba en ambos. Un amigo en común los vio en un restaurante besándose y me lo contó. La traición fue doble: no solo me engañó, sino que fue con alguien que yo consideraba hermano. Me destrozó completamente. Perdí a mi novia y a mi mejor amigo en un solo día. Esta mujer es una basura sin valores.'
        },
        {
          nombre: 'María',
          apellido: getRandomApellidos(),
          pais: 'Ecuador',
          provincia: 'Tungurahua',
          ciudad: 'Ambato',
          edad: '30',
          ocupacion: 'Profesora',
          historia: 'Vivíamos juntos hace 5 años y descubrí que esta perra tenía Tinder activo desde hace 2 años. Encontré su teléfono abierto y vi las conversaciones. Había estado saliendo con diferentes tipos, teniendo encuentros casuales mientras yo trabajaba para pagar nuestro departamento. Dos años siendo cornudo sin saberlo. Me siento como un idiota total. Esta mujer me usó, me mintió todos los días, durmió conmigo después de estar con otros. Es repugnante.'
        },
        {
          nombre: 'Daniela',
          apellido: getRandomApellidos(),
          pais: 'Ecuador',
          provincia: 'Loja',
          ciudad: 'Loja',
          edad: '27',
          ocupacion: 'Enfermera',
          historia: 'Estaba comprometido con esta mujer, la boda era en una semana. Un día que usé su computadora para trabajar, encontré mensajes con su ex. Fotos íntimas, conversaciones románticas, planes de verse. Me destrozó. Cancelé la boda, perdí todo el dinero que invertí, y ella ni siquiera se disculpó. Solo me dijo que todavía tenía sentimientos por él. Me usó, me hizo perder tiempo y dinero. Esta zorra me arruinó la vida.'
        },
        {
          nombre: 'Andrea',
          apellido: getRandomApellidos(),
          pais: 'Ecuador',
          provincia: 'El Oro',
          ciudad: 'Machala',
          edad: '29',
          ocupacion: 'Abogada',
          historia: 'Mi novia se fue a un viaje de trabajo y me engañó con un tipo que conoció en una conferencia. Lo descubrí por fotos en Instagram donde aparecían juntos en eventos. Cuando regresó, noté que había cambiado, ya no me quería tocar. Revisé sus mensajes y encontré las conversaciones. Fotos de ellos en el hotel, mensajes de "fue increíble anoche". Me destrozó. Esta perra me traicionó en un viaje que yo pagué. Me siento usado y humillado.'
        },
        {
          nombre: 'Natalia',
          apellido: getRandomApellidos(),
          pais: 'Ecuador',
          provincia: 'Imbabura',
          ciudad: 'Ibarra',
          edad: '26',
          ocupacion: 'Psicóloga',
          historia: 'Mi esposa es psicóloga y se acostó con uno de sus pacientes. Encontré facturas de hoteles caros y regalos que no podía explicar. Cuando la confronté, admitió que había tenido una relación con un paciente durante meses. No solo me traicionó, sino que violó códigos éticos de su profesión. Esta mujer es una basura sin moral. Me siento traicionado de la peor manera posible. Perdí todo el respeto que tenía por ella.'
        },
        {
          nombre: 'Gabriela',
          apellido: getRandomApellidos(),
          pais: 'Ecuador',
          provincia: 'Chimborazo',
          ciudad: 'Riobamba',
          edad: '31',
          ocupacion: 'Arquitecta',
          historia: 'Mi esposa me engañó con un cliente durante un proyecto de construcción. Descubrí todo cuando revisé los registros de llamadas y vi conversaciones a las 2, 3 de la mañana. La confronté y me confesó que había estado acostándose con ese tipo durante meses. No solo me traicionó, sino que arruinó su reputación profesional. Esta zorra destruyó nuestro matrimonio y su carrera por un capricho. Me siento completamente traicionado, 7 años de matrimonio tirados a la basura.'
        },
        {
          nombre: 'Paola',
          apellido: getRandomApellidos(),
          pais: 'Ecuador',
          provincia: 'Cotopaxi',
          ciudad: 'Latacunga',
          edad: '24',
          ocupacion: 'Estudiante',
          historia: 'Mi novia tuvo una "aventura de una noche" que se convirtió en una relación de meses. Encontré mensajes en su teléfono de un número que no conocía. Al investigar, descubrí que había estado viendo a este tipo regularmente, mintiéndome sobre sus actividades, inventando excusas para justificar sus ausencias. Esta perra me mintió todos los días durante meses. Me siento como un idiota por haber confiado en ella. Perdí mi tiempo y mi amor con una mujer sin valores.'
        }
      ];

      let successCount = 0;
      let errorCount = 0;

      for (const lady of fakeLadys) {
        try {
          await addDoc(collection(db, 'persons'), {
            nombre: lady.nombre,
            apellido: lady.apellido,
            pais: lady.pais,
            provincia: lady.provincia,
            ciudad: lady.ciudad,
            edad: lady.edad,
            ocupacion: lady.ocupacion,
            historia: lady.historia,
            fotos: [],
            approved: false,
            conocidaSi: 0,
            conocidaNo: 0,
            createdAt: Timestamp.now(),
          });
          successCount++;
        } catch (error) {
          console.error(`Error agregando ${lady.nombre}:`, error);
          errorCount++;
        }
      }

      await showAlert(
        `Se crearon ${successCount} ladys ficticias exitosamente${errorCount > 0 ? `. ${errorCount} errores.` : '.'}`,
        'Ladys Creadas',
        'success'
      );
      
      // Recargar la lista
      await loadPersons();
    } catch (error) {
      console.error('Error generando ladys ficticias:', error);
      await showAlert('Error al crear las ladys ficticias', 'Error', 'error');
    } finally {
      setSeeding(false);
    }
  };

  if (!user) {
    return null;
  }

  // Si el PIN no está verificado, mostrar pantalla en blanco con modal de PIN
  if (!pinVerified) {
    return (
      <div className="min-h-screen bg-palette-pearl flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-palette-lavender/20"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-palette-lavender to-palette-quartz rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold text-palette-graphite mb-2">
              Acceso Protegido
            </h2>
            <p className="text-sm text-palette-graphite/60">
              Ingresa el PIN para acceder al panel de administrador
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="PIN"
                maxLength="4"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition text-center text-2xl tracking-widest"
                autoFocus
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-palette-lavender to-palette-quartz text-palette-graphite py-3 rounded-xl font-medium shadow-lg"
            >
              Verificar PIN
            </motion.button>
          </form>

          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-4 text-palette-graphite/60 hover:text-palette-graphite text-sm"
          >
            Volver
          </motion.button>
        </motion.div>
      </div>
    );
  }

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
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full bg-gradient-to-r from-palette-lavender via-palette-quartz to-palette-gold backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-palette-quartz/40"
      >
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-palette-pearl/90 rounded-full flex items-center justify-center shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-palette-graphite" />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-palette-pearl/90 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-palette-gold" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-palette-graphite">
                Panel de Administrador
              </h1>
              <p className="text-sm text-palette-graphite/60">
                Gestión de ladys
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        {/* Estadísticas */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-palette-pearl rounded-2xl shadow-lg p-6 mb-6 border border-palette-lavender/20"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Contador de Ladies */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-palette-lavender to-palette-quartz rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-palette-graphite">
                  {persons.length}
                </p>
                <p className="text-sm text-palette-graphite/60">
                  {persons.length === 1 ? 'Lady registrada' : 'Ladys registradas'}
                </p>
              </div>
            </div>

            {/* Contador de Usuarios */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-palette-quartz to-palette-gold rounded-full flex items-center justify-center">
                <UserX className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-palette-graphite">
                  {usersCount}
                </p>
                <p className="text-sm text-palette-graphite/60">
                  {usersCount === 1 ? 'Usuario registrado' : 'Usuarios registrados'}
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="grid grid-cols-5 gap-2">
            <motion.button
              onClick={generateFakeLadys}
              disabled={seeding}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-palette-gold to-palette-lavender text-palette-graphite py-3 rounded-xl font-medium shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seeding ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-palette-graphite border-t-transparent rounded-full"
                  />
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Seed</span>
                </>
              )}
            </motion.button>
            <motion.button
              onClick={() => setShowPushModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-palette-lavender to-palette-quartz text-palette-graphite py-3 rounded-xl font-medium shadow-lg text-sm"
            >
              <Bell className="w-4 h-4" />
              <span>Push</span>
            </motion.button>

            <motion.button
              onClick={() => {
                const newShowUsers = !showUsers;
                setShowUsers(newShowUsers);
                setShowPending(false);
                setShowAll(false);
                if (newShowUsers) {
                  loadUsers();
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium shadow-lg text-sm ${
                showUsers 
                  ? 'bg-gradient-to-r from-palette-quartz to-palette-gold text-palette-graphite' 
                  : 'bg-gradient-to-r from-palette-quartz/50 to-palette-gold/50 text-palette-graphite'
              }`}
            >
              <UserX className="w-4 h-4" />
              <span>Usuarios</span>
            </motion.button>

            <motion.button
              onClick={() => {
                setShowPending(!showPending);
                setShowAll(false);
                setShowUsers(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium shadow-lg relative text-sm ${
                showPending 
                  ? 'bg-gradient-to-r from-palette-quartz to-palette-gold text-palette-graphite' 
                  : 'bg-gradient-to-r from-palette-quartz/50 to-palette-gold/50 text-palette-graphite'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Nuevas</span>
              {pendingPersons.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                  {pendingPersons.length}
                </span>
              )}
            </motion.button>

            <motion.button
              onClick={() => {
                setShowAll(!showAll);
                setShowPending(false);
                setShowUsers(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium shadow-lg text-sm ${
                showAll 
                  ? 'bg-gradient-to-r from-palette-lavender to-palette-quartz text-palette-graphite' 
                  : 'bg-gradient-to-r from-palette-lavender/50 to-palette-quartz/50 text-palette-graphite'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Todas</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Lista de todas las ladys registradas */}
        {showAll && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-display font-bold text-palette-graphite mb-4">
              Todas las Ladys Registradas ({persons.length})
            </h2>
            {persons.length === 0 ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12 bg-palette-pearl rounded-2xl"
              >
                <p className="text-palette-graphite/80 text-lg">No hay ladys registradas</p>
              </motion.div>
            ) : (
              persons.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-palette-pearl rounded-2xl shadow-lg p-4 border border-palette-lavender/20"
                >
                  <div className="flex items-center gap-4">
                    {/* Foto */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-palette-lavender to-palette-quartz flex items-center justify-center">
                      {person.fotos && person.fotos.length > 0 ? (
                        <img
                          src={person.fotos[0]}
                          alt={`${person.nombre} ${person.apellido}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-palette-graphite/40" />
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-palette-graphite">
                        {person.nombre} {person.apellido}
                      </h3>
                      <p className="text-sm text-palette-graphite/60">
                        {person.ciudad}, {person.pais}
                      </p>
                      {person.fotos && person.fotos.length > 0 && (
                        <p className="text-xs text-palette-graphite/50 mt-1">
                          {person.fotos.length} foto{person.fotos.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => navigate(`/person/${person.id}`)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-palette-lavender/20 hover:bg-palette-lavender/30 rounded-lg flex items-center justify-center transition"
                        title="Ver perfil"
                      >
                        <Eye className="w-5 h-5 text-palette-lavender" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(person.id, `${person.nombre} ${person.apellido}`)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Lista de usuarios registrados */}
        {showUsers && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-2"
          >
            <h2 className="text-lg font-display font-bold text-palette-graphite mb-3">
              Usuarios Registrados ({users.length})
            </h2>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8 bg-palette-pearl rounded-xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-4 border-palette-lavender border-t-transparent rounded-full"
                />
              </div>
            ) : users.length === 0 ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8 bg-palette-pearl rounded-xl"
              >
                <p className="text-palette-graphite/80">No hay usuarios registrados</p>
              </motion.div>
            ) : (
              users.map((user, index) => (
                <motion.div
                  key={user.uid}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-palette-pearl rounded-xl shadow-md p-2.5 border border-palette-lavender/20"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Foto/Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-palette-lavender to-palette-quartz flex items-center justify-center flex-shrink-0">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.email}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-display font-bold text-palette-graphite truncate">
                        {user.displayName || user.email}
                      </h3>
                      <p className="text-xs text-palette-graphite/60 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {user.emailVerified && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                            ✓
                          </span>
                        )}
                        {user.lastSignInTime && (
                          <span className="text-xs text-palette-graphite/50 truncate">
                            {new Date(user.lastSignInTime).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <motion.button
                      onClick={() => handleDeleteUser(user.uid, user.email)}
                      disabled={deletingUserId === user.uid}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition disabled:opacity-50 flex-shrink-0"
                      title="Eliminar usuario"
                    >
                      {deletingUserId === user.uid ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
                        />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-600" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Lista de ladys pendientes de aprobación */}
        {showPending && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-display font-bold text-palette-graphite mb-4">
              Ladys Pendientes de Aprobación ({pendingPersons.length})
            </h2>
            {pendingPersons.length === 0 ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12 bg-palette-pearl rounded-2xl"
              >
                <p className="text-palette-graphite/80 text-lg">No hay ladys pendientes de aprobación</p>
              </motion.div>
            ) : (
              pendingPersons.map((person, index) => (
                <motion.div
                  key={person.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-palette-pearl rounded-2xl shadow-lg p-4 border border-palette-lavender/20"
                >
                  <div className="flex items-center gap-4">
                    {/* Foto */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-palette-lavender to-palette-quartz flex items-center justify-center">
                      {person.fotos && person.fotos.length > 0 ? (
                        <img
                          src={person.fotos[0]}
                          alt={`${person.nombre} ${person.apellido}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-palette-graphite/40" />
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-palette-graphite">
                        {person.nombre} {person.apellido}
                      </h3>
                      <p className="text-sm text-palette-graphite/60">
                        {person.ciudad}, {person.pais}
                      </p>
                      {person.fotos && person.fotos.length > 0 && (
                        <p className="text-xs text-palette-graphite/50 mt-1">
                          {person.fotos.length} foto{person.fotos.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => navigate(`/person/${person.id}`, { state: { fromAdmin: true } })}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-palette-lavender/20 hover:bg-palette-lavender/30 rounded-lg flex items-center justify-center transition"
                        title="Ver perfil"
                      >
                        <Eye className="w-5 h-5 text-palette-lavender" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(person.id, `${person.nombre} ${person.apellido}`)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Modal para enviar notificaciones push */}
      <AnimatePresence>
        {showPushModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => !pushSending && setShowPushModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-palette-lavender/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-display font-bold text-palette-graphite">
                  Enviar Notificación Push
                </h2>
                <motion.button
                  onClick={() => setShowPushModal(false)}
                  disabled={pushSending}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-palette-graphite" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-palette-graphite mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="Título de la notificación"
                    disabled={pushSending}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition text-palette-graphite"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-palette-graphite mb-2">
                    Mensaje
                  </label>
                  <textarea
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    placeholder="Mensaje de la notificación"
                    disabled={pushSending}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition text-palette-graphite resize-none"
                    maxLength={500}
                  />
                </div>

                <div className="bg-palette-pearl rounded-xl p-3">
                  <p className="text-sm text-palette-graphite/60">
                    Se enviará a <span className="font-bold text-palette-graphite">{fcmTokens.length}</span> dispositivo{fcmTokens.length !== 1 ? 's' : ''} registrado{fcmTokens.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setShowPushModal(false)}
                    disabled={pushSending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-palette-graphite rounded-xl font-medium transition disabled:opacity-50"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={handleSendPush}
                    disabled={pushSending || !pushTitle.trim() || !pushBody.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-palette-lavender to-palette-quartz text-palette-graphite rounded-xl font-medium shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {pushSending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-palette-graphite border-t-transparent rounded-full"
                        />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminPanel;

