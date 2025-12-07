import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { uploadMultiplePhotosToB2 } from '../b2/upload';
import { notifyAdminNewLady } from '../services/pushNotifications';

// Agregar una nueva persona
export const addPerson = async (personData) => {
  try {
    const docRef = await addDoc(collection(db, 'persons'), {
      nombre: personData.nombre,
      apellido: personData.apellido,
      pais: personData.pais,
      ciudad: personData.ciudad,
      historia: personData.historia || '',
      fotos: [],
      approved: false, // Por defecto no está aprobada
      conocidaSi: 0, // Votos "Sí, la conozco"
      conocidaNo: 0, // Votos "No, no la conozco"
      createdAt: Timestamp.now(),
    });

    // Enviar notificación push al administrador
    const ladyName = `${personData.nombre} ${personData.apellido}`;
    notifyAdminNewLady(ladyName, personData.ciudad, personData.pais).catch((error) => {
      console.error('Error enviando notificación al administrador:', error);
      // No lanzar error para que no interrumpa el flujo
    });

    return docRef.id;
  } catch (error) {
    console.error('Error agregando persona:', error);
    throw error;
  }
};

// Subir fotos a Backblaze B2 y agregar URLs a la persona
export const uploadPhotos = async (personId, photoFiles) => {
  try {
    // Subir todas las fotos a B2
    const photoUrls = await uploadMultiplePhotosToB2(photoFiles, personId);
    
    // Actualizar el documento de la persona con las nuevas fotos
    const personRef = doc(db, 'persons', personId);
    await updateDoc(personRef, {
      fotos: arrayUnion(...photoUrls)
    });
    
    return photoUrls;
  } catch (error) {
    console.error('Error subiendo fotos:', error);
    throw error;
  }
};

// Obtener todas las personas (solo las aprobadas)
export const getPersons = async () => {
  try {
    const q = query(
      collection(db, 'persons'), 
      where('approved', '==', true)
    );
    const querySnapshot = await getDocs(q);
    const persons = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      persons.push({
        id: doc.id,
        conocidaSi: data.conocidaSi || 0,
        conocidaNo: data.conocidaNo || 0,
        ...data
      });
    });
    
    // Ordenar por las más conocidas (más votos "Sí")
    // Si hay empate, ordenar por menos votos "No"
    persons.sort((a, b) => {
      const aTotal = (a.conocidaSi || 0) - (a.conocidaNo || 0);
      const bTotal = (b.conocidaSi || 0) - (b.conocidaNo || 0);
      if (bTotal !== aTotal) {
        return bTotal - aTotal; // Más conocidas primero
      }
      // Si hay empate, ordenar por fecha más reciente
      return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
    });
    
    return persons;
  } catch (error) {
    console.error('Error obteniendo personas:', error);
    // Si no hay índice para approved, intentar sin filtro
    try {
      const q = query(collection(db, 'persons'));
      const querySnapshot = await getDocs(q);
      const persons = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrar solo las aprobadas o las que no tienen el campo (para compatibilidad)
        if (data.approved !== false) {
          persons.push({
            id: doc.id,
            conocidaSi: data.conocidaSi || 0,
            conocidaNo: data.conocidaNo || 0,
            ...data
          });
        }
      });
      
      // Ordenar por las más conocidas
      persons.sort((a, b) => {
        const aTotal = (a.conocidaSi || 0) - (a.conocidaNo || 0);
        const bTotal = (b.conocidaSi || 0) - (b.conocidaNo || 0);
        if (bTotal !== aTotal) {
          return bTotal - aTotal;
        }
        return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
      });
      
      return persons;
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError);
      throw error;
    }
  }
};

// Votar por una persona (Sí o No)
export const votePerson = async (personId, vote) => {
  try {
    const personRef = doc(db, 'persons', personId);
    const field = vote === 'si' ? 'conocidaSi' : 'conocidaNo';
    await updateDoc(personRef, {
      [field]: increment(1)
    });
    return true;
  } catch (error) {
    console.error('Error votando por persona:', error);
    throw error;
  }
};

// Obtener una persona por ID
export const getPersonById = async (personId) => {
  try {
    const docRef = doc(db, 'persons', personId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Persona no encontrada');
    }
  } catch (error) {
    console.error('Error obteniendo persona:', error);
    throw error;
  }
};

