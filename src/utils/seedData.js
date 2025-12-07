import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Datos de prueba para 10 ladys - Ecuador, Venezuela, Colombia
const seedLadys = [
  {
    nombre: 'Sofia',
    apellido: 'Martinez',
    ciudad: 'Quito',
    pais: 'Ecuador',
    fotos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'],
  },
  {
    nombre: 'Isabella',
    apellido: 'Rodriguez',
    ciudad: 'Guayaquil',
    pais: 'Ecuador',
    fotos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'],
  },
  {
    nombre: 'Valentina',
    apellido: 'Garcia',
    ciudad: 'Cuenca',
    pais: 'Ecuador',
    fotos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop'],
  },
  {
    nombre: 'Camila',
    apellido: 'Lopez',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    fotos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop'],
  },
  {
    nombre: 'Mariana',
    apellido: 'Gonzalez',
    ciudad: 'Medellín',
    pais: 'Colombia',
    fotos: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop'],
  },
  {
    nombre: 'Daniela',
    apellido: 'Hernandez',
    ciudad: 'Cali',
    pais: 'Colombia',
    fotos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'],
  },
  {
    nombre: 'Andrea',
    apellido: 'Perez',
    ciudad: 'Caracas',
    pais: 'Venezuela',
    fotos: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop'],
  },
  {
    nombre: 'Gabriela',
    apellido: 'Sanchez',
    ciudad: 'Maracaibo',
    pais: 'Venezuela',
    fotos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop'],
  },
  {
    nombre: 'Natalia',
    apellido: 'Ramirez',
    ciudad: 'Valencia',
    pais: 'Venezuela',
    fotos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'],
  },
  {
    nombre: 'Fernanda',
    apellido: 'Torres',
    ciudad: 'Barranquilla',
    pais: 'Colombia',
    fotos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'],
  },
];

// Función para poblar la base de datos con datos de prueba
export const seedDatabase = async () => {
  try {
    console.log('Iniciando carga de datos de prueba...');
    
    for (const lady of seedLadys) {
      const docRef = await addDoc(collection(db, 'persons'), {
        nombre: lady.nombre,
        apellido: lady.apellido,
        ciudad: lady.ciudad,
        pais: lady.pais,
        redesSociales: {},
        fotos: lady.fotos,
        createdAt: Timestamp.now(),
      });
      console.log(`✓ Lady agregada: ${lady.nombre} ${lady.apellido} (ID: ${docRef.id})`);
    }
    
    console.log('✅ Todas las ladys de prueba han sido agregadas exitosamente!');
    return true;
  } catch (error) {
    console.error('❌ Error agregando datos de prueba:', error);
    throw error;
  }
};

// Función para ejecutar desde la consola del navegador
if (typeof window !== 'undefined') {
  window.seedDatabase = seedDatabase;
}

