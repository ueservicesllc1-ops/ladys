// Servicio para verificar y gestionar actualizaciones de la app

const VERSION_CHECK_INTERVAL = 3600000; // 1 hora en milisegundos
const VERSION_URL = '/version.json'; // URL del archivo de versión

let currentVersion = null;
let checkInterval = null;

// Obtener versión actual de la app
export const getCurrentVersion = () => {
  if (!currentVersion) {
    // Obtener versión del package.json o de una constante
    currentVersion = {
      version: '1.0.2',
      build: 3,
    };
  }
  return currentVersion;
};

// Verificar versión en el servidor
export const checkVersion = async () => {
  try {
    const response = await fetch(`${VERSION_URL}?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error('Error al verificar versión');
    }
    const serverVersion = await response.json();
    return serverVersion;
  } catch (error) {
    console.error('Error verificando versión:', error);
    return null;
  }
};

// Comparar versiones
const compareVersions = (current, server) => {
  if (!server) return false;
  
  // Comparar por build number (más simple)
  if (server.build > current.build) {
    return true;
  }
  
  // Comparar por versión semántica
  const currentParts = current.version.split('.').map(Number);
  const serverParts = server.version.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, serverParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const serverPart = serverParts[i] || 0;
    
    if (serverPart > currentPart) {
      return true;
    } else if (serverPart < currentPart) {
      return false;
    }
  }
  
  return false;
};

// Verificar si hay actualización disponible
export const hasUpdateAvailable = async () => {
  try {
    const current = getCurrentVersion();
    const server = await checkVersion();
    
    if (!server) return false;
    
    return compareVersions(current, server);
  } catch (error) {
    console.error('Error verificando actualización:', error);
    return false;
  }
};

// Obtener información de actualización
export const getUpdateInfo = async () => {
  try {
    const server = await checkVersion();
    return server;
  } catch (error) {
    console.error('Error obteniendo información de actualización:', error);
    return null;
  }
};

// Iniciar verificación periódica de versiones
export const startVersionCheck = (onUpdateAvailable) => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  
  // Verificar inmediatamente al abrir la app
  const checkNow = async () => {
    try {
      const hasUpdate = await hasUpdateAvailable();
      if (hasUpdate && onUpdateAvailable) {
        const info = await getUpdateInfo();
        if (info) {
          onUpdateAvailable(info);
        }
      }
    } catch (error) {
      console.error('Error en verificación inmediata:', error);
    }
  };
  
  // Verificar inmediatamente
  checkNow();
  
  // Verificar periódicamente (cada hora)
  checkInterval = setInterval(checkNow, VERSION_CHECK_INTERVAL);
  
  return checkInterval;
};

// Detener verificación de versiones
export const stopVersionCheck = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
};

// Descargar actualización (para APK)
export const downloadUpdate = async (downloadUrl) => {
  try {
    if (downloadUrl) {
      // Abrir el link de descarga
      // En Android, esto abrirá el navegador del sistema y permitirá descargar el APK
      // El link de Google Drive ya está configurado para descarga directa
      window.open(downloadUrl, '_blank');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error descargando actualización:', error);
    // Fallback: intentar abrir de nuevo
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
    return false;
  }
};

