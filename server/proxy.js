import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  try {
    let serviceAccount = null;
    let serviceAccountPath = null;

    // 1. Intentar desde variable de entorno (ruta del archivo)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    }
    // 2. Intentar desde variable de entorno (JSON directo)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    // 3. Buscar archivo en la carpeta server
    else {
      const possiblePaths = [
        join(__dirname, 'serviceAccountKey.json'),
        join(__dirname, '../serviceAccountKey.json'),
      ];
      
      for (const path of possiblePaths) {
        if (existsSync(path)) {
          serviceAccountPath = path;
          break;
        }
      }
    }

    // Cargar credenciales desde archivo si se encontró una ruta
    if (serviceAccountPath && !serviceAccount) {
      serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      console.log(`[Firebase Admin] Credenciales cargadas desde: ${serviceAccountPath}`);
    }

    // Inicializar solo si tenemos credenciales válidas
    if (serviceAccount && serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[Firebase Admin] Inicializado correctamente');
    } else {
      throw new Error('No se encontraron credenciales válidas. Ver FIREBASE_ADMIN_SETUP.md para configurar.');
    }
  } catch (error) {
    console.warn('[Firebase Admin] Error inicializando:', error.message);
    console.warn('[Firebase Admin] Los endpoints de usuarios no funcionarán sin credenciales');
    console.warn('[Firebase Admin] Ver FIREBASE_ADMIN_SETUP.md para instrucciones de configuración');
  }
}

// Configuración de Backblaze B2 desde variables de entorno
const b2Config = {
  keyId: process.env.B2_KEY_ID || '005c2b526be0baa0000000026',
  applicationKey: process.env.B2_APPLICATION_KEY || 'K005jZQmHXremE1cYJUNwzK0lajLXZo',
  bucketName: process.env.B2_BUCKET_NAME || 'infieles',
  endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
  region: process.env.B2_REGION || 'us-east-005',
  publicFileId: process.env.B2_PUBLIC_FILE_ID || 'f005',
};

// Log de configuración (sin mostrar credenciales completas)
console.log('[B2 Config] Bucket:', b2Config.bucketName);
console.log('[B2 Config] Endpoint:', b2Config.endpoint);
console.log('[B2 Config] Region:', b2Config.region);
console.log('[B2 Config] Key ID:', b2Config.keyId ? `${b2Config.keyId.substring(0, 10)}...` : 'No configurado');
console.log('[B2 Config] Application Key:', b2Config.applicationKey ? 'Configurado' : 'No configurado');

// Crear cliente S3 para Backblaze B2
const s3Client = new S3Client({
  endpoint: b2Config.endpoint,
  region: b2Config.region,
  credentials: {
    accessKeyId: b2Config.keyId,
    secretAccessKey: b2Config.applicationKey,
  },
  forcePathStyle: true, // Necesario para B2
});

// Función para generar URL pública
const getPublicUrl = (key) => {
  return `https://${b2Config.publicFileId}.backblazeb2.com/file/${b2Config.bucketName}/${key}`;
};

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// Middleware para parsear JSON
app.use(express.json());

// Configurar multer para manejar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
});

// Configuración de Firebase Cloud Messaging
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY || '';
const FCM_API_URL = 'https://fcm.googleapis.com/fcm/send';

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'B2 Proxy Server is running' });
});

// Endpoint para verificar versión de la app
app.get('/version.json', (req, res) => {
  // Leer el archivo version.json desde la carpeta public
  const versionPath = join(__dirname, '../public/version.json');
  
  try {
    if (existsSync(versionPath)) {
      const versionData = JSON.parse(readFileSync(versionPath, 'utf8'));
      res.json(versionData);
    } else {
      // Si no existe, devolver versión por defecto
      res.json({
        version: '1.0.0',
        build: 1,
        releaseDate: new Date().toISOString(),
        downloadUrl: process.env.APP_DOWNLOAD_URL || 'https://tu-dominio.com/app-release.apk',
        updateRequired: false,
        updateMessage: '',
        changelog: []
      });
    }
  } catch (error) {
    console.error('Error leyendo version.json:', error);
    res.status(500).json({ error: 'Error al obtener versión' });
  }
});

// Endpoint para subir fotos
app.post('/api/upload', upload.array('photos', 10), async (req, res) => {
  try {
    const { personId } = req.body;
    
    if (!personId) {
      return res.status(400).json({ error: 'personId es requerido' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const uploadedUrls = [];

    // Subir cada archivo a B2
    for (const file of req.files) {
      const timestamp = Date.now();
      const fileName = `${personId}/${timestamp}_${file.originalname}`;
      const key = `persons/${fileName}`;

      // Crear comando de subida
      const command = new PutObjectCommand({
        Bucket: b2Config.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      // Subir a B2
      await s3Client.send(command);

      // Generar URL pública
      const publicUrl = getPublicUrl(key);
      uploadedUrls.push(publicUrl);
    }

    res.json({
      success: true,
      urls: uploadedUrls,
      message: `${uploadedUrls.length} foto(s) subida(s) exitosamente`,
    });
  } catch (error) {
    console.error('Error subiendo archivos a B2:', error);
    console.error('Bucket configurado:', b2Config.bucketName);
    console.error('Endpoint configurado:', b2Config.endpoint);
    console.error('Key ID configurado:', b2Config.keyId ? 'Sí (oculto)' : 'No');
    
    // Mensaje de error más descriptivo
    let errorMessage = error.message || 'Error desconocido';
    if (errorMessage.includes('bucket does not exist')) {
      errorMessage = `El bucket "${b2Config.bucketName}" no existe o no tienes permisos para acceder. Verifica las credenciales y el nombre del bucket.`;
    } else if (errorMessage.includes('InvalidAccessKeyId') || errorMessage.includes('SignatureDoesNotMatch')) {
      errorMessage = 'Credenciales de Backblaze B2 inválidas. Verifica B2_KEY_ID y B2_APPLICATION_KEY.';
    } else if (errorMessage.includes('AccessDenied')) {
      errorMessage = 'Acceso denegado al bucket. Verifica los permisos de las credenciales.';
    }
    
    res.status(500).json({
      error: 'Error subiendo archivos a B2',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// Endpoint para enviar notificaciones push
app.post('/api/send-push', async (req, res) => {
  try {
    const { tokens, title, body, data } = req.body;

    if (!FCM_SERVER_KEY) {
      return res.status(500).json({ 
        error: 'FCM_SERVER_KEY no configurada. Configura la variable de entorno FCM_SERVER_KEY' 
      });
    }

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de tokens' });
    }

    if (!title || !body) {
      return res.status(400).json({ error: 'Título y cuerpo son requeridos' });
    }

    const results = [];
    const errors = [];

    // Enviar notificación a cada token
    for (const token of tokens) {
      try {
        const message = {
          to: token,
          notification: {
            title,
            body,
            icon: '/logo.jpg',
            click_action: process.env.APP_URL || 'http://localhost:5173',
          },
          data: data || {},
        };

        const response = await fetch(FCM_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${FCM_SERVER_KEY}`,
          },
          body: JSON.stringify(message),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          results.push({ token, success: true });
        } else {
          errors.push({ token, error: result.error || 'Error desconocido' });
        }
      } catch (error) {
        errors.push({ token, error: error.message });
      }
    }

    res.json({
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error enviando notificaciones push:', error);
    res.status(500).json({
      error: 'Error enviando notificaciones push',
      message: error.message,
    });
  }
});

// Endpoint para listar usuarios
app.get('/api/users', async (req, res) => {
  try {
    if (!admin.apps.length) {
      return res.status(503).json({ 
        error: 'Firebase Admin no está configurado. Configura las credenciales de servicio.' 
      });
    }

    const listUsersResult = await admin.auth().listUsers(1000); // Máximo 1000 usuarios
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
      providerData: user.providerData.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })),
    }));

    res.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({
      error: 'Error al listar usuarios',
      message: error.message,
    });
  }
});

// Endpoint para eliminar un usuario
app.delete('/api/users/:uid', async (req, res) => {
  try {
    if (!admin.apps.length) {
      return res.status(503).json({ 
        error: 'Firebase Admin no está configurado. Configura las credenciales de servicio.' 
      });
    }

    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ error: 'UID del usuario es requerido' });
    }

    await admin.auth().deleteUser(uid);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      error: 'Error al eliminar usuario',
      message: error.message,
    });
  }
});

// Servir archivos estáticos del build (para producción)
const distPath = join(__dirname, '../dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Todas las rutas que no sean /api/* sirven el index.html (SPA)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(join(distPath, 'index.html'));
  });
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Servidor corriendo en http://0.0.0.0:${PORT}`);
  console.log(`[Server] Endpoint de subida: http://0.0.0.0:${PORT}/api/upload`);
  if (existsSync(distPath)) {
    console.log(`[Server] Sirviendo archivos estáticos desde: ${distPath}`);
  }
});

