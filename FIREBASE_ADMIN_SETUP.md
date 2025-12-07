 # 🔐 Configuración de Firebase Admin SDK

Para que la funcionalidad de ver y eliminar usuarios funcione, necesitas configurar Firebase Admin SDK en el servidor.

## 📋 Pasos para Configurar

### 1. Obtener las Credenciales de Servicio

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **infieles-29223**
3. Ve a **Configuración del proyecto** (ícono de engranaje) → **Cuentas de servicio**
4. Haz clic en **Generar nueva clave privada**
5. Se descargará un archivo JSON con las credenciales

### 2. Configurar las Credenciales

Tienes dos opciones:

#### Opción A: Archivo JSON (Recomendado para desarrollo)

1. Guarda el archivo JSON descargado en la carpeta `server/` con el nombre `serviceAccountKey.json`
2. Agrega `serviceAccountKey.json` al `.gitignore` para no subirlo al repositorio
3. Actualiza `server/proxy.js` para usar la ruta del archivo:

```javascript
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
```

#### Opción B: Variable de Entorno (Recomendado para producción)

1. Convierte el contenido del JSON a una sola línea (sin saltos de línea)
2. Agrega la variable de entorno:

```bash
# En .env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"infieles-29223",...}'
```

O usa la ruta del archivo:

```bash
# En .env
FIREBASE_SERVICE_ACCOUNT_PATH=./server/serviceAccountKey.json
```

### 3. Actualizar el Código del Servidor

El código ya está preparado para usar las credenciales. Solo necesitas:

1. Si usas archivo JSON, actualiza la ruta en `server/proxy.js`:
   ```javascript
   const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
   ```

2. Si usas variable de entorno, el código ya está configurado para leerla.

### 4. Verificar que Funciona

1. Inicia el servidor:
   ```bash
   npm run dev:server
   ```

2. Deberías ver en la consola:
   ```
   [Firebase Admin] Inicializado correctamente
   ```

3. Si ves un error, verifica:
   - Que el archivo JSON existe y está en la ruta correcta
   - Que las credenciales son válidas
   - Que el proyecto ID es correcto

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- **NUNCA** subas el archivo `serviceAccountKey.json` al repositorio
- Agrega `serviceAccountKey.json` al `.gitignore`
- En producción, usa variables de entorno
- Las credenciales de servicio tienen acceso completo a tu proyecto Firebase

## 🧪 Probar los Endpoints

Una vez configurado, puedes probar los endpoints:

### Listar usuarios:
```bash
curl http://localhost:3001/api/users
```

### Eliminar usuario:
```bash
curl -X DELETE http://localhost:3001/api/users/USER_UID
```

## 📝 Notas

- Los endpoints requieren que Firebase Admin SDK esté configurado
- Si no está configurado, los endpoints devolverán un error 503
- El límite de usuarios listados es 1000 (puedes ajustarlo en el código)

