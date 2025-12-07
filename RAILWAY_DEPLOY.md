# 🚀 Despliegue en Railway

Guía para desplegar la app Infieles en Railway como Web App First Mobile.

## 📋 Prerequisitos

1. Cuenta en [Railway](https://railway.app/)
2. Repositorio Git (GitHub, GitLab, o Bitbucket)

## 🚢 Pasos para Desplegar

### 1. Preparar el Repositorio

```bash
# Asegúrate de que todos los cambios estén commiteados
git add .
git commit -m "Preparar para despliegue en Railway"
git push
```

### 2. Crear Proyecto en Railway

1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"** (o tu proveedor de Git)
4. Selecciona el repositorio `infieles`
5. Railway detectará automáticamente el proyecto

### 3. Configurar Variables de Entorno

En Railway, ve a tu proyecto → **Variables** y agrega:

#### Backblaze B2 (Obligatorio)
```
B2_KEY_ID=005c2b526be0baa0000000026
B2_APPLICATION_KEY=K005jZQmHXremE1cYJUNwzK0lajLXZo
B2_BUCKET_NAME=infieles
B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
B2_REGION=us-east-005
B2_PUBLIC_FILE_ID=f005
```

#### Firebase Admin SDK (Opcional - para gestión de usuarios)

**Opción A: Variable de entorno JSON**
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"infieles-29223",...}
```
*(Pega todo el JSON en una sola línea)*

**Opción B: Usar archivo (más complejo)**
- Sube `serviceAccountKey.json` a Railway usando el sistema de archivos

### 4. Configurar el Build

Railway usará automáticamente:
- **Build Command**: `npm run build`
- **Start Command**: `node server/proxy.js`

Esto está configurado en `railway.json` y `railway.toml`.

### 5. Desplegar

1. Railway comenzará a construir automáticamente
2. Espera a que el build termine
3. Railway asignará una URL pública (ej: `https://infieles-production.up.railway.app`)

### 6. Configurar Dominio Personalizado (Opcional)

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones de Railway

## 🔧 Configuración Adicional

### Puerto

Railway asigna automáticamente el puerto a través de la variable `PORT`. El servidor ya está configurado para usar `process.env.PORT || 3001`.

### Archivos Estáticos

El servidor sirve automáticamente los archivos del build desde `/dist` cuando están disponibles.

### Logs

Puedes ver los logs en tiempo real en Railway Dashboard → **Deployments** → **View Logs**.

## 🐛 Solución de Problemas

### Build Falla
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Railway

### La App No Carga
- Verifica que el build se completó correctamente
- Revisa los logs del servidor
- Asegúrate de que las variables de entorno estén configuradas

### Errores de CORS
- El servidor ya tiene CORS configurado para permitir todas las solicitudes
- Si necesitas restringir, modifica `server/proxy.js`

### Firebase Admin No Funciona
- Verifica que `FIREBASE_SERVICE_ACCOUNT` esté configurado correctamente
- El JSON debe estar en una sola línea sin saltos
- O usa `FIREBASE_SERVICE_ACCOUNT_PATH` si subiste el archivo

## 📱 Web App First Mobile

La app está optimizada para funcionar como PWA (Progressive Web App):

- ✅ Responsive design
- ✅ Funciona offline (con service workers si los agregas)
- ✅ Instalable en dispositivos móviles
- ✅ Optimizada para touch

## 🔄 Actualizaciones

Cada vez que hagas `git push` a la rama principal, Railway desplegará automáticamente la nueva versión.

## 📝 Notas

- El servidor sirve tanto la API (`/api/*`) como los archivos estáticos
- El build se ejecuta automáticamente en Railway
- Railway asigna automáticamente HTTPS
- El puerto se asigna automáticamente

