import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';
import TermsAndConditions from './TermsAndConditions';

const Login = () => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const { showAlert } = useDialog();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este correo electrónico ya está registrado. Inicia sesión en su lugar.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
      case 'auth/user-not-found':
        return 'No existe una cuenta con este correo electrónico.';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde.';
      default:
        return 'Ocurrió un error. Intenta de nuevo.';
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      await showAlert('Debes aceptar los términos y condiciones para continuar', 'Términos y Condiciones', 'warning');
      return;
    }

    if (!email || !password) {
      await showAlert('Por favor completa todos los campos', 'Campos Requeridos', 'warning');
      return;
    }

    if (isRegisterMode) {
      if (password !== confirmPassword) {
        await showAlert('Las contraseñas no coinciden', 'Error de Validación', 'error');
        return;
      }
      if (password.length < 6) {
        await showAlert('La contraseña debe tener al menos 6 caracteres', 'Contraseña Débil', 'warning');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      
      if (isRegisterMode) {
        await register(email, password);
        await showAlert('¡Cuenta creada exitosamente!', 'Registro Exitoso', 'success');
      } else {
        await login(email, password);
      }
      
      navigate('/');
    } catch (error) {
      console.error(`Error en ${isRegisterMode ? 'registro' : 'login'}:`, error);
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      await showAlert(errorMessage, isRegisterMode ? 'Error al Registrarse' : 'Error al Iniciar Sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!acceptedTerms) {
      await showAlert('Debes aceptar los términos y condiciones para continuar', 'Términos y Condiciones', 'warning');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const user = await loginWithGoogle();
      
      // En Android con redirect, user será null y la navegación se maneja después
      // En web con popup, user será el usuario autenticado
      if (user) {
        navigate('/');
      }
      // Si es null (Android redirect), no navegamos porque el redirect se maneja automáticamente
    } catch (error) {
      console.error('Error en login con Google:', error);
      const errorMessage = getErrorMessage(error.code || error.message);
      setError(errorMessage);
      await showAlert(errorMessage || 'Error al iniciar sesión con Google. Intenta de nuevo.', 'Error de Autenticación', 'error');
    } finally {
      // Solo desactivar loading si no es un redirect (Android)
      // En Android, el redirect mantiene la app cargando hasta que vuelve
      if (typeof window !== 'undefined' && !window.location.href.includes('__/auth/handler')) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-palette-pearl flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-palette-lavender/20"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-palette-lavender via-palette-quartz to-palette-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-palette-graphite mb-2">
            {isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h1>
          <p className="text-palette-graphite/60">
            {isRegisterMode ? 'Regístrate para comenzar' : 'Accede a tu cuenta'}
          </p>
        </div>

        {/* Toggle entre Login y Registro */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <motion.button
            onClick={() => {
              setIsRegisterMode(false);
              setError('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              !isRegisterMode
                ? 'bg-white text-palette-graphite shadow-md'
                : 'text-palette-graphite/60 hover:text-palette-graphite'
            }`}
          >
            Iniciar Sesión
          </motion.button>
          <motion.button
            onClick={() => {
              setIsRegisterMode(true);
              setError('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              isRegisterMode
                ? 'bg-white text-palette-graphite shadow-md'
                : 'text-palette-graphite/60 hover:text-palette-graphite'
            }`}
          >
            Registrarse
          </motion.button>
        </div>

        {/* Formulario de Email/Password */}
        <form onSubmit={handleEmailAuth} className="mb-4 space-y-4">
          {/* Campo Email */}
          <div>
            <label className="block text-sm font-medium text-palette-graphite mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-palette-graphite/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Campo Password */}
          <div>
            <label className="block text-sm font-medium text-palette-graphite mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-palette-graphite/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-palette-graphite/40 hover:text-palette-graphite"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Campo Confirmar Password (solo en modo registro) */}
          {isRegisterMode && (
            <div>
              <label className="block text-sm font-medium text-palette-graphite mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-palette-graphite/40" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-palette-lavender focus:outline-none transition"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-palette-graphite/40 hover:text-palette-graphite"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Botón Submit */}
          <motion.button
            type="submit"
            disabled={loading || !acceptedTerms}
            whileHover={acceptedTerms && !loading ? { scale: 1.02 } : {}}
            whileTap={acceptedTerms && !loading ? { scale: 0.98 } : {}}
            className="w-full bg-gradient-to-r from-palette-lavender via-palette-quartz to-palette-gold text-white py-4 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>{isRegisterMode ? 'Creando cuenta...' : 'Iniciando sesión...'}</span>
              </>
            ) : (
              <span>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-palette-graphite/60">o</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Checkbox de Términos y Condiciones */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-5 h-5 text-palette-lavender border-2 border-gray-300 rounded focus:ring-2 focus:ring-palette-lavender focus:ring-offset-2 cursor-pointer"
            />
            <span className="text-sm text-palette-graphite leading-relaxed flex-1">
              Acepto los{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTerms(true);
                }}
                className="text-palette-lavender hover:text-palette-quartz font-medium underline"
              >
                términos y condiciones
              </button>
            </span>
          </label>
        </div>

        {/* Login con Google */}
        <motion.button
          onClick={handleGoogleLogin}
          disabled={loading || !acceptedTerms}
          whileHover={acceptedTerms && !loading ? { scale: 1.02 } : {}}
          whileTap={acceptedTerms && !loading ? { scale: 0.98 } : {}}
          className="w-full bg-white border-2 border-gray-300 hover:border-palette-lavender text-palette-graphite py-4 rounded-xl font-medium shadow-lg flex items-center justify-center gap-3 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-palette-graphite border-t-transparent rounded-full"
            />
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </motion.button>

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}

        {!acceptedTerms && (
          <p className="text-palette-graphite/60 text-xs mt-4 text-center">
            Debes aceptar los términos y condiciones para continuar
          </p>
        )}
      </motion.div>

      {/* Modal de Términos y Condiciones */}
      <AnimatePresence>
        {showTerms && (
          <TermsAndConditions onClose={() => setShowTerms(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;

