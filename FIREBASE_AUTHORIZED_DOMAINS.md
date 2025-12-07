# 🔐 Configurar Dominios Autorizados en Firebase

## ❌ Error Actual

```
Firebase: Error (auth/unauthorized-domain)
The current domain is not authorized for OAuth operations.
Domain: ladys-production.up.railway.app
```

## ✅ Solución

Necesitas agregar el dominio de Railway a la lista de dominios autorizados en Firebase.

### Pasos:

1. **Ve a Firebase Console**
   - Abre [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Selecciona tu proyecto: **infieles-29223**

2. **Ve a Authentication**
   - En el menú lateral, haz clic en **Authentication**
   - Luego haz clic en la pestaña **Settings** (Configuración)

3. **Agrega el Dominio Autorizado**
   - Desplázate hasta la sección **Authorized domains** (Dominios autorizados)
   - Haz clic en **Add domain** (Agregar dominio)
   - Ingresa: `ladys-production.up.railway.app`
   - Haz clic en **Add** (Agregar)

4. **Agregar Dominio Personalizado**
   - Agrega: `infieles.website`
   - Si tienes otros dominios personalizados en Railway, también agrégalos

### Dominios que Debes Agregar:

- ✅ `ladys-production.up.railway.app` (dominio de Railway)
- ✅ `infieles.website` (dominio personalizado)
- ✅ Tu dominio personalizado adicional (si lo tienes configurado)
- ✅ `localhost` (ya debería estar, para desarrollo local)

### Dominios por Defecto (Ya Incluidos):

Firebase incluye automáticamente estos dominios:
- `localhost`
- `*.firebaseapp.com`
- `*.web.app`

### Verificación

Después de agregar el dominio:
1. Espera unos segundos para que los cambios se propaguen
2. Recarga la app en Railway
3. Intenta hacer login con Google nuevamente

## 📝 Nota Importante

Cada vez que Railway asigne un nuevo dominio o cambies de dominio, debes agregarlo a la lista de dominios autorizados en Firebase.

## 🔄 Dominios Múltiples

Si tienes múltiples ambientes (desarrollo, staging, producción), agrega todos los dominios:
- `ladys-production.up.railway.app` (dominio de Railway)
- `infieles.website` (dominio personalizado)
- `ladys-staging.up.railway.app` (si tienes staging)
- Otros dominios personalizados que uses

## 📝 Dominios Configurados Actualmente

Para este proyecto, debes agregar estos dominios en Firebase:

1. **`ladys-production.up.railway.app`** - Dominio automático de Railway
2. **`infieles.website`** - Dominio personalizado principal
3. **`localhost`** - Para desarrollo local (ya incluido por defecto)

