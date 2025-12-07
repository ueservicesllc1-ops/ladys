import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

// Configuración de Firebase desde variables de entorno o valores por defecto
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCTMcvvzi7q0lgDm2NfEa4OTDdbh9_iKzE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "infieles-29223.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "infieles-29223",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "infieles-29223.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "588069651968",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:588069651968:web:c671adbbbf1af13dbc3ae5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6GNBHWCNKQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics (solo en el navegador)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Messaging (solo en el navegador y si está soportado)
let messaging = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        messaging = getMessaging(app);
      } catch (error) {
        console.warn('Error inicializando Firebase Messaging:', error);
      }
    }
  }).catch((error) => {
    console.warn('Firebase Messaging no soportado:', error);
  });
}

export { analytics, messaging };
export default app;

