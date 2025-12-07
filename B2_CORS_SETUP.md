# Configuración de Servidor Proxy para Backblaze B2

## Solución Implementada

Como Backblaze B2 no permite configurar CORS directamente, hemos creado un **servidor proxy** que maneja las subidas desde el navegador a B2.

## Cómo Funciona

1. **Cliente (Navegador)** → Envía fotos al servidor proxy
2. **Servidor Proxy** → Recibe las fotos y las sube a Backblaze B2 usando S3 API
3. **Backblaze B2** → Almacena las fotos
4. **Servidor Proxy** → Retorna las URLs públicas al cliente

## Instalación

Las dependencias ya están en `package.json`. Solo necesitas instalar:

```bash
npm install
```

## Ejecutar la Aplicación

### Opción 1: Ejecutar todo junto (Recomendado)

```bash
npm run dev
```

Esto ejecutará:
- Servidor proxy en `http://localhost:3001`
- Cliente Vite en `http://localhost:5173`

### Opción 2: Ejecutar por separado

**Terminal 1 - Servidor Proxy:**
```bash
npm run dev:server
```

**Terminal 2 - Cliente:**
```bash
npm run dev:client
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (opcional, tiene valores por defecto):

```env
# Puerto del servidor proxy
PORT=3001

# Variables de Backblaze B2 (opcionales, tienen valores por defecto)
B2_KEY_ID=tu_key_id_aqui
B2_APPLICATION_KEY=tu_application_key_aqui
B2_BUCKET_NAME=infieles
B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
B2_REGION=us-east-005
B2_PUBLIC_FILE_ID=f005

# URL del proxy para el cliente (solo necesario en producción)
VITE_PROXY_URL=http://localhost:3001
```

**Nota:** Si no creas el archivo `.env`, el servidor usará los valores por defecto hardcodeados (solo para desarrollo).

### Configuración del Servidor Proxy

El servidor proxy está configurado en `server/proxy.js` con:
- Puerto: `3001` (por defecto)
- Endpoint de subida: `/api/upload`
- CORS habilitado para `localhost:5173` y `localhost:3000`

### Configuración del Cliente

El cliente está configurado para usar el proxy a través de Vite:
- En desarrollo: Vite redirige `/api/upload` → `http://localhost:3001/api/upload`
- En producción: Usa la variable `VITE_PROXY_URL`

## Estructura

```
infieles/
├── server/
│   └── proxy.js          # Servidor proxy para B2
├── src/
│   └── b2/
│       └── upload.js     # Cliente que usa el proxy
└── vite.config.js        # Configuración de proxy de Vite
```

## Verificar que Funciona

1. **Verificar servidor proxy:**
   ```bash
   curl http://localhost:3001/health
   ```
   Debería retornar: `{"status":"ok","message":"B2 Proxy Server is running"}`

2. **Probar subida:**
   - Abre la app en `http://localhost:5173`
   - Agrega una persona con fotos
   - Las fotos se subirán a B2 a través del proxy

## Solución de Problemas

### Error: "Cannot connect to proxy server"
**Solución**: Asegúrate de que el servidor proxy esté corriendo en el puerto 3001

### Error: "CORS policy" en el navegador
**Solución**: El servidor proxy ya tiene CORS configurado. Verifica que el origen esté en la lista de `cors()` en `server/proxy.js`

### Error: "ECONNREFUSED"
**Solución**: 
- Verifica que el puerto 3001 no esté en uso
- Cambia el puerto en `.env` si es necesario

### Las fotos no se suben
**Solución**:
- Revisa la consola del servidor proxy para ver errores
- Verifica las credenciales de B2 en las variables de entorno o en `server/proxy.js` (valores por defecto)
- Asegúrate de que el bucket `infieles` exista y sea accesible

## Producción

Para producción:

1. **Despliega el servidor proxy** (puede ser en el mismo servidor o separado)
2. **Configura la variable de entorno** `VITE_PROXY_URL` con la URL de tu servidor proxy
3. **Actualiza los orígenes permitidos en CORS** en `server/proxy.js` con tu dominio de producción
4. **Compila la app:**
   ```bash
   npm run build
   ```

## Seguridad

> **Importante para Producción:**
- **USA VARIABLES DE ENTORNO** para las credenciales de B2 (B2_KEY_ID, B2_APPLICATION_KEY, etc.)
- NO subas el archivo `.env` a tu repositorio (debe estar en `.gitignore`)
- Limita los orígenes permitidos en CORS solo a tus dominios
- Implementa autenticación si es necesario

## Ventajas de esta Solución

- No requiere configuración de CORS en B2
- Las credenciales de B2 están en el servidor (más seguro)
- Funciona desde cualquier navegador
- Fácil de desplegar y mantener
