import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import PersonList from './components/PersonList';
import PersonDetail from './components/PersonDetail';
import AddPersonForm from './components/AddPersonForm';
import Gallery from './components/Gallery';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Footer from './components/Footer';
import { requestNotificationPermission, setupMessageListener } from './services/pushNotifications';
import { startVersionCheck, stopVersionCheck, getUpdateInfo } from './services/versionChecker';
import UpdateModal from './components/UpdateModal';

// Componente para proteger rutas - requiere login
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para proteger ruta de admin - requiere ser admin
const AdminRoute = ({ children }) => {
  const { user, loading, isAuthorizedUser } = useAuth();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorizedUser()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    // Solicitar permisos de notificación cuando la app carga y hay un usuario
    if (user && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Solo solicitar si el usuario aún no ha decidido
        requestNotificationPermission(user.email).catch((error) => {
          console.log('Permisos de notificación no otorgados:', error.message);
        });
      } else if (Notification.permission === 'granted') {
        // Si ya tiene permisos, actualizar el token con el email del usuario
        requestNotificationPermission(user.email).catch((error) => {
          console.log('Error actualizando token:', error.message);
        });
        // Configurar el listener
        setupMessageListener();
      }
    }

    // Verificar actualizaciones cuando la app carga
    const handleUpdateAvailable = (info) => {
      if (info) {
        setUpdateInfo(info);
      }
    };

    startVersionCheck(handleUpdateAvailable);

    // Limpiar al desmontar
    return () => {
      stopVersionCheck();
    };
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-palette-pearl pb-20">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <PersonList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/person/:id" 
            element={
              <ProtectedRoute>
                <PersonDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add" 
            element={
              <ProtectedRoute>
                <AddPersonForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gallery" 
            element={
              <ProtectedRoute>
                <Gallery />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />
        </Routes>
        <Footer />
      </div>
      
      {/* Modal de actualización */}
      {updateInfo && (
        <UpdateModal 
          updateInfo={updateInfo} 
          onClose={() => setUpdateInfo(null)} 
        />
      )}
    </Router>
  );
}

export default App;

