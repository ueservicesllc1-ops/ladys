# 📱 Guía para Generar y Publicar el APK

## ✅ APK Generado Exitosamente

El APK de release se ha generado en:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## 📋 Pasos para Publicar el APK

### 1. Firmar el APK (Opcional pero Recomendado)

Para distribuir el APK, es recomendable firmarlo. Si no tienes un keystore, puedes usar el APK sin firmar para pruebas, pero Google Play requiere un APK firmado.

**Crear un keystore (solo la primera vez):**
```bash
cd android/app
keytool -genkey -v -keystore infieles-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias infieles
```

**Firmar el APK:**
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore infieles-release-key.jks app-release-unsigned.apk infieles
```

### 2. Subir el APK a Google Drive

1. Ve a [Google Drive](https://drive.google.com)
2. Sube el archivo `app-release-unsigned.apk` (o el firmado si lo firmaste)
3. Haz clic derecho en el archivo → **Compartir** → **Obtener enlace**
4. Configura el acceso como **"Cualquier persona con el enlace"** para que todos puedan descargarlo
5. Copia el ID del archivo de la URL

**Ejemplo:**
- URL compartida: `https://drive.google.com/file/d/182TCOG7orqS_Qc5cjTkZbiDW8_Gh3rZx/view?usp=sharing`
- ID del archivo: `182TCOG7orqS_Qc5cjTkZbiDW8_Gh3rZx`

### 3. Actualizar el Link de Descarga

Edita el archivo `public/version.json` y actualiza el `downloadUrl` con el nuevo ID:

```json
{
  "version": "1.0.1",
  "build": 2,
  "releaseDate": "2024-01-15",
  "downloadUrl": "https://drive.google.com/uc?export=download&id=NUEVO_ID_AQUI",
  "updateRequired": false,
  "updateMessage": "Nueva versión disponible con mejoras y nuevas funcionalidades.",
  "changelog": [
    "Sistema de votación para ladies",
    "Contador de votos en la lista principal",
    "Mejoras en la interfaz de usuario",
    "Sistema de actualización automática"
  ]
}
```

**Formato del downloadUrl:**
```
https://drive.google.com/uc?export=download&id=ID_DEL_ARCHIVO
```

### 4. Recompilar la Aplicación

Después de actualizar `version.json`, recompila:

```bash
npm run build
npm run cap:sync
```

Esto copiará el nuevo `version.json` a la carpeta `dist` y sincronizará con Android.

### 5. (Opcional) Generar un Nuevo APK con la Versión Actualizada

Si quieres que el nuevo APK ya incluya el `version.json` actualizado:

```bash
npm run cap:build:android:release
```

## 🔄 Cómo Funciona el Sistema de Actualización Automática

1. **Verificación Automática**: La app verifica cada hora si hay una nueva versión disponible
2. **Comparación de Versiones**: Compara el `build` number y la `version` del dispositivo con el servidor
3. **Modal de Actualización**: Si hay una nueva versión, muestra un modal al usuario
4. **Descarga Directa**: Al hacer clic en "Descargar Actualización", abre el link de Google Drive en el navegador
5. **Instalación Manual**: El usuario debe instalar el APK manualmente (Android requiere permisos de instalación de fuentes desconocidas)

## 📝 Para Futuras Actualizaciones

Cada vez que quieras publicar una nueva versión:

1. **Incrementa las versiones:**
   - En `android/app/build.gradle`: `versionCode` y `versionName`
   - En `public/version.json`: `version` y `build` (siempre incrementa `build`)

2. **Genera el nuevo APK:**
   ```bash
   npm run cap:build:android:release
   ```

3. **Sube el nuevo APK a Google Drive** (puedes reemplazar el anterior)

4. **Actualiza `downloadUrl` en `version.json`** con el nuevo ID (si cambió)

5. **Recompila:**
   ```bash
   npm run build
   npm run cap:sync
   ```

6. **Opcional**: Genera un nuevo APK con el `version.json` actualizado

## ⚠️ Importante

- **Siempre incrementa el `build` number** - Es la forma más confiable de detectar actualizaciones
- **El link de Google Drive debe ser público** - O al menos accesible sin autenticación
- **Los usuarios necesitan permitir "Instalar desde fuentes desconocidas"** en Android
- **El sistema verifica cada hora** - Los usuarios verán la actualización en la próxima verificación

## 🔗 Link Actual de Google Drive

**Link compartido:**
https://drive.google.com/file/d/182TCOG7orqS_Qc5cjTkZbiDW8_Gh3rZx/view?usp=sharing

**Link directo de descarga (para version.json):**
```
https://drive.google.com/uc?export=download&id=182TCOG7orqS_Qc5cjTkZbiDW8_Gh3rZx
```

## 📱 Versión Actual del APK

- **Version Code**: 2
- **Version Name**: 1.0.1
- **Build**: 2
- **Ubicación**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## 🧪 Probar la Actualización

1. Instala la versión actual (build 1) en un dispositivo
2. Actualiza `version.json` con build 3
3. Recompila y sincroniza
4. Espera hasta 1 hora (o reinicia la app para verificar inmediatamente)
5. Deberías ver el modal de actualización

