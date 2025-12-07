import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCTMcvvzi7q0lgDm2NfEa4OTDdbh9_iKzE",
  authDomain: "infieles-29223.firebaseapp.com",
  projectId: "infieles-29223",
  storageBucket: "infieles-29223.firebasestorage.app",
  messagingSenderId: "588069651968",
  appId: "1:588069651968:web:c671adbbbf1af13dbc3ae5",
  measurementId: "G-6GNBHWCNKQ"
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

