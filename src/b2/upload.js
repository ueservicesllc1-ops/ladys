// URL del servidor proxy
// En desarrollo, Vite proxy redirige /api/upload a localhost:3001
// En producción, usar la variable de entorno VITE_PROXY_URL
const PROXY_URL = import.meta.env.VITE_PROXY_URL || '/api/upload';

/**
 * Sube múltiples fotos a Backblaze B2 a través del servidor proxy
 * @param {File[]} files - Array de archivos
 * @param {string} personId - ID de la persona
 * @returns {Promise<string[]>} Array de URLs públicas
 */
export const uploadMultiplePhotosToB2 = async (files, personId) => {
  try {
    // Crear FormData para enviar al proxy
    const formData = new FormData();
    formData.append('personId', personId);
    
    // Agregar todos los archivos
    files.forEach((file) => {
      formData.append('photos', file);
    });

    // Enviar al servidor proxy (Vite redirige /api/upload al servidor)
    const uploadUrl = PROXY_URL.startsWith('http') ? `${PROXY_URL}/api/upload` : '/api/upload';
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.urls) {
      throw new Error(data.message || 'Error en la respuesta del servidor');
    }

    return data.urls;
  } catch (error) {
    console.error('Error subiendo fotos a B2 a través del proxy:', error);
    throw error;
  }
};

