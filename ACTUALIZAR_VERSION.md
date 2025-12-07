# 📱 Guía para Actualizar Versiones del APK

## 🔄 Cómo Funciona el Sistema de Actualización Automática

La app verifica automáticamente cada hora si hay una nueva versión disponible. Cuando detecta una actualización, muestra un modal al usuario para descargar el nuevo APK.

## 📝 Pasos para Publicar una Nueva Versión

### 1. Generar el Nuevo APK

```bash
npm run cap:build:android
```

El APK se generará en: `android/app/build/outputs/apk/debug/app-debug.apk`

### 2. Subir el APK a Google Drive

1. Ve a [Google Drive](https://drive.google.com)
2. Sube el nuevo APK (puedes reemplazar el anterior o crear uno nuevo)
3. Haz clic derecho en el archivo → **Compartir** → **Obtener enlace**
4. Copia el ID del archivo de la URL

**Ejemplo:**
- URL compartida: `https://drive.google.com/file/d/182TCOG7orqS_Qc5cjTkZbiDW8_Gh3rZx/view?usp=sharing`
- ID del archivo: `182TCOG7orqS_Qc5cjTkZbiDW8_Gh3rZx`

### 3. Actualizar `version.json`

Edita el archivo `public/version.json` y actualiza:

```json
{
  "version": "1.0.1",           // ← Incrementa la versión (ej: 1.0.0 → 1.0.1)
  "build": 2,                    // ← Incrementa el build number (siempre +1)
  "releaseDate": "2024-01-20",   // ← Fecha actual
  "downloadUrl": "https://drive.google.com/uc?export=download&id=TU_ID_AQUI",  // ← Usa el ID del paso 2
  "updateRequired": false,        // ← true si es obligatorio, false si es opcional
  "updateMessage": "Nueva versión con mejoras y correcciones",
  "changelog": [
    "Corrección de errores",
    "Mejoras en el rendimiento",
    "Nuevas funcionalidades"
  ]
}
```

**Formato del downloadUrl:**
```
https://drive.google.com/uc?export=download&id=TU_ID_DEL_ARCHIVO
```

### 4. Recompilar y Sincronizar

```bash
npm run build
npm run cap:sync
```

Esto copiará el nuevo `version.json` a la carpeta `dist` y luego a Android.

### 5. (Opcional) Actualizar la Versión en Android

Si quieres que la versión del APK también coincida, edita `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 2        // ← Incrementa (debe ser mayor que el anterior)
    versionName "1.0.1" // ← Nueva versión
}
```

## 🔗 Link Actual de Google Drive

**Link compartido:**
https://drive.google.com/file/d/182TCOG7orqS_Qc5cjTkZbiDW8_Gh3rZx/view?usp=sharing

**Link directo de descarga (para version.json):**
```
https://drive.google.com/uc?export=download&id=182TCOG7orqS_Qc5cjTkZbiDW8_Gh3rZx
```

## ⚠️ Importante

1. **Siempre incrementa el `build` number** - Es la forma más confiable de detectar actualizaciones
2. **Actualiza ambos archivos** - `public/version.json` y se copiará a `dist/` automáticamente
3. **El link de Google Drive debe ser público** - O al menos accesible sin autenticación
4. **Después de actualizar version.json, recompila** - Para que los cambios se reflejen en la app

## 🧪 Probar la Actualización

1. Instala la versión actual en un dispositivo
2. Actualiza `version.json` con una versión mayor
3. Espera hasta 1 hora (o reinicia la app para verificar inmediatamente)
4. Deberías ver el modal de actualización

## 📋 Checklist para Cada Nueva Versión

- [ ] Generar nuevo APK
- [ ] Subir APK a Google Drive
- [ ] Obtener ID del archivo
- [ ] Actualizar `version` en `public/version.json`
- [ ] Incrementar `build` en `public/version.json`
- [ ] Actualizar `downloadUrl` con el nuevo ID
- [ ] Actualizar `releaseDate`
- [ ] Agregar items al `changelog`
- [ ] Ejecutar `npm run build && npm run cap:sync`
- [ ] (Opcional) Actualizar `versionCode` y `versionName` en `build.gradle`

