import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDialog } from '../contexts/DialogContext';

const ShieldButton = () => {
  const navigate = useNavigate();
  const { isAuthorizedUser, logout, user } = useAuth();
  const { showAlert, showConfirm } = useDialog();

  const handleShieldClick = async () => {
    if (isAuthorizedUser()) {
      // Si es admin, navegar al panel de administrador
      navigate('/admin');
    } else {
      // Si no es admin, mostrar mensaje
      await showAlert('Solo el administrador puede acceder a esta función', 'Acceso Restringido', 'warning');
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      '¿Estás seguro de que deseas cerrar sesión?',
      'Confirmar Cierre de Sesión'
    );
    
    if (confirmed) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        await showAlert('Error al cerrar sesión. Intenta de nuevo.', 'Error', 'error');
      }
    }
  };

  // Solo mostrar si el usuario está logueado (todos los usuarios logueados pueden verlo)
  if (!user) return null;

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
      {/* Botón de Logout */}
      <motion.button
        onClick={handleLogout}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 bg-palette-pearl/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
        title="Cerrar sesión"
      >
        <LogOut className="w-5 h-5 text-palette-graphite" />
      </motion.button>

      {/* Botón de Shield */}
      <motion.button
        onClick={handleShieldClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 bg-palette-pearl/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
        title={isAuthorizedUser() ? 'Panel de Administrador' : 'Solo para administrador'}
      >
        <Shield className={`w-5 h-5 ${isAuthorizedUser() ? 'text-palette-gold' : 'text-palette-graphite/60'}`} />
      </motion.button>
    </div>
  );
};

export default ShieldButton;
