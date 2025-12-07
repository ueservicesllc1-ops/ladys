import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { Capacitor } from '@capacitor/core';

const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();

// Función para detectar si estamos en Android
const isAndroidPlatform = () => {
  try {
    return Capacitor.getPlatform() === 'android';
  } catch (error) {
    // Si Capacitor no está disponible, asumimos que es web
    return false;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAndroid = isAndroidPlatform();
    
    // Configurar persistencia para Android
    if (isAndroid) {
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.warn('Error configurando persistencia:', error);
      });
    }

    // Manejar redirect result cuando la app vuelve de OAuth
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('Error en redirect result:', error);
      }
    };

    // Verificar redirect result al cargar (solo en Android)
    if (isAndroid) {
      handleRedirectResult();
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const isAndroid = isAndroidPlatform();
      
      // En Android usar redirect, en web usar popup
      if (isAndroid) {
        // signInWithRedirect no retorna un resultado inmediatamente
        // El resultado se maneja en useEffect con getRedirectResult
        await signInWithRedirect(auth, googleProvider);
        // No retornamos aquí porque el redirect se maneja después
        return null;
      } else {
        // En web usar popup
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      }
    } catch (error) {
      // Si el error es que ya hay un redirect pendiente, ignorarlo
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        throw new Error('El inicio de sesión fue cancelado');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const isAuthorizedUser = () => {
    return user && user.email === 'ueservicesllc1@gmail.com';
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAuthorizedUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

