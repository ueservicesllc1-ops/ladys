import { getToken, onMessage } from 'firebase/messaging';
import { collection, addDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db, messaging } from '../firebase/config';

// Solicitar permisos y obtener token de FCM
export const requestNotificationPermission = async (userEmail = null) => {
  try {
    if (!('Notification' in window)) {
      throw new Error('Este navegador no soporta notificaciones');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permiso de notificaciones denegado');
    }

    if (!messaging) {
      throw new Error('Firebase Messaging no está disponible en este navegador');
    }
    
    // Obtener token (necesitas configurar el VAPID key en Firebase Console)
    // El VAPID key se puede obtener de Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
    const vapidKey = import.meta.env.VITE_FCM_VAPID_KEY || 'TU_VAPID_KEY_AQUI';
    const token = await getToken(messaging, { vapidKey });
    
    if (token) {
      // Guardar token en Firestore con el email del usuario
      await saveTokenToFirestore(token, userEmail);
      return token;
    } else {
      throw new Error('No se pudo obtener el token de notificación');
    }
  } catch (error) {
    console.error('Error solicitando permisos de notificación:', error);
    throw error;
  }
};

// Guardar token en Firestore
const saveTokenToFirestore = async (token, userEmail = null) => {
  try {
    // Verificar si el token ya existe
    const tokensRef = collection(db, 'fcmTokens');
    const q = query(tokensRef, where('token', '==', token));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Token no existe, agregarlo
      await addDoc(tokensRef, {
        token,
        userEmail: userEmail || null,
        createdAt: new Date(),
        userId: null, // Opcional: asociar con usuario
      });
    } else {
      // Si el token existe, actualizar el email si es necesario
      const existingDoc = querySnapshot.docs[0];
      if (userEmail && existingDoc.data().userEmail !== userEmail) {
        await updateDoc(existingDoc.ref, {
          userEmail: userEmail,
        });
      }
    }
  } catch (error) {
    console.error('Error guardando token:', error);
  }
};

// Escuchar mensajes cuando la app está en primer plano
export const setupMessageListener = () => {
  try {
    if (!messaging) {
      console.warn('Firebase Messaging no está disponible');
      return;
    }
    onMessage(messaging, (payload) => {
      console.log('Mensaje recibido:', payload);
      // Mostrar notificación personalizada
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'Nueva notificación', {
          body: payload.notification?.body || '',
          icon: payload.notification?.icon || '/logo.jpg',
        });
      }
    });
  } catch (error) {
    console.error('Error configurando listener de mensajes:', error);
  }
};

// Obtener todos los tokens registrados
export const getAllTokens = async () => {
  try {
    const tokensRef = collection(db, 'fcmTokens');
    const querySnapshot = await getDocs(tokensRef);
    const tokens = [];
    querySnapshot.forEach((doc) => {
      tokens.push({ id: doc.id, ...doc.data() });
    });
    return tokens;
  } catch (error) {
    console.error('Error obteniendo tokens:', error);
    throw error;
  }
};

// Obtener tokens del administrador
export const getAdminTokens = async () => {
  try {
    const tokensRef = collection(db, 'fcmTokens');
    const q = query(tokensRef, where('userEmail', '==', 'ueservicesllc1@gmail.com'));
    const querySnapshot = await getDocs(q);
    const tokens = [];
    querySnapshot.forEach((doc) => {
      tokens.push(doc.data().token);
    });
    return tokens;
  } catch (error) {
    console.error('Error obteniendo tokens del administrador:', error);
    return [];
  }
};

// Enviar notificación push al administrador
export const notifyAdminNewLady = async (ladyName, ladyCity, ladyCountry) => {
  try {
    const adminTokens = await getAdminTokens();
    
    if (adminTokens.length === 0) {
      console.log('No hay tokens del administrador registrados');
      return;
    }

    const title = 'Nueva Lady Registrada';
    const body = `${ladyName} de ${ladyCity}, ${ladyCountry} está esperando aprobación`;

    const response = await fetch('http://localhost:3001/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: adminTokens,
        title,
        body,
        data: {
          type: 'new_lady',
          action: 'review',
        },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Notificación enviada al administrador:', result);
    } else {
      console.error('Error enviando notificación al administrador');
    }
  } catch (error) {
    console.error('Error notificando al administrador:', error);
    // No lanzar error para que no interrumpa el flujo de agregar lady
  }
};
