# Guía para Generar APK y Sistema de Actualización Automática

## 📱 Generar APK con Capacitor

### 1. Instalar Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### 2. Inicializar Capacitor (si es primera vez)

```bash
npm run cap:init
```

Esto creará el archivo `capacitor.config.json` con la configuración de la app.

### 3. Agregar plataforma Android

```bash
npm run cap:add:android
```

### 4. Compilar la aplicación

```bash
npm run build
```

### 5. Sincronizar con Capacitor

```bash
npm run cap:sync
```

Este comando:
- Copia los archivos de `dist` a la carpeta `android`
- Actualiza la configuración de Capacitor

### 6. Abrir en Android Studio

```bash
npm run cap:open:android
```

### 7. Generar APK en Android Studio

1. Abre Android Studio
2. Ve a **Build > Generate Signed Bundle / APK**
3. Selecciona **APK**
4. Crea o selecciona un keystore (para producción)
5. Completa el formulario y genera el APK

**O desde la terminal:**

```bash
cd android
./gradlew assembleRelease
```

El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

## 🌐 Subir APK a un Servidor Web

### Opción 1: Servidor Simple

1. Sube el APK a tu servidor web (ej: `https://tu-dominio.com/app-release.apk`)
2. Actualiza `public/version.json` con la URL del APK:

```json
{
  "version": "1.0.1",
  "build": 2,
  "downloadUrl": "https://tu-dominio.com/app-release.apk",
  "updateRequired": false
}
```

### Opción 2: Usar Firebase Hosting

```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

## 🔄 Sistema de Actualización Automática

### Cómo Funciona

1. **Archivo de Versión**: `public/version.json` contiene la versión actual del servidor
2. **Verificación Automática**: La app verifica cada hora si hay actualizaciones
3. **Modal de Actualización**: Si hay una nueva versión, se muestra un modal
4. **Descarga**: El usuario puede descargar el nuevo APK directamente

### Actualizar la Versión

1. **Incrementar versión** en `public/version.json`:
   - `version`: Versión semántica (ej: "1.0.1")
   - `build`: Número de build (incrementar en 1)
   - `downloadUrl`: URL donde está el nuevo APK
   - `updateRequired`: `true` si es obligatorio, `false` si es opcional

2. **Subir nuevo APK** al servidor

3. **La app detectará automáticamente** la nueva versión

### Ejemplo de version.json

```json
{
  "version": "1.0.1",
  "build": 2,
  "releaseDate": "2024-01-15",
  "downloadUrl": "https://tu-dominio.com/app-release-v1.0.1.apk",
  "updateRequired": false,
  "updateMessage": "Nueva versión con mejoras de rendimiento",
  "changelog": [
    "Mejoras en el rendimiento",
    "Corrección de errores",
    "Nuevas funcionalidades"
  ]
}
```

## 📝 Configuración del Servidor

El servidor proxy ya incluye un endpoint para servir `version.json`:

```
GET /version.json
```

Asegúrate de que el archivo `public/version.json` esté accesible.

## 🔧 Variables de Entorno

Puedes configurar la URL de descarga con una variable de entorno:

```env
APP_DOWNLOAD_URL=https://tu-dominio.com/app-release.apk
```

## 📦 Estructura de Archivos

```
infieles/
├── public/
│   ├── version.json          # Archivo de versión
│   └── manifest.json         # PWA manifest
├── android/                  # Proyecto Android (generado por Capacitor)
│   └── app/
│       └── build/
│           └── outputs/
│               └── apk/
│                   └── release/
│                       └── app-release.apk
├── capacitor.config.json    # Configuración de Capacitor
└── src/
    └── services/
        └── versionChecker.js # Servicio de verificación de versiones
```

## 🚀 Comandos Rápidos

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Sincronizar con Capacitor
npm run cap:sync

# Abrir Android Studio
npm run cap:open:android

# Build completo (build + sync)
npm run cap:build:android
```

## ⚠️ Notas Importantes

1. **Keystore**: Para producción, necesitas un keystore firmado. Guárdalo de forma segura.
2. **Permisos**: Asegúrate de que la app tenga permisos para instalar APKs desde fuentes desconocidas
3. **HTTPS**: El servidor debe usar HTTPS para que las descargas funcionen correctamente
4. **Versionado**: Siempre incrementa el `build` number cuando subas una nueva versión

