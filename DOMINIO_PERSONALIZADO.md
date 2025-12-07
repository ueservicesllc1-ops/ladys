# 🌐 Configuración de Dominio Personalizado

## 📋 Dominio Configurado

**Dominio principal:** `infieles.website`

## 🔧 Pasos para Configurar

### 1. Configurar en Railway

1. Ve a tu proyecto en [Railway Dashboard](https://railway.app/dashboard)
2. Selecciona tu servicio
3. Ve a **Settings** → **Domains**
4. Haz clic en **"Custom Domain"** o **"Add Domain"**
5. Ingresa: `infieles.website`
6. Railway te dará un registro DNS a configurar

### 2. Configurar DNS en tu Proveedor de Dominio

Configura el registro DNS según las instrucciones de Railway:

**Opción A: CNAME (Recomendado)**
```
Tipo: CNAME
Nombre: @ (o infieles)
Valor: [el dominio que Railway te proporcione, ej: xxx.up.railway.app]
TTL: 3600 (o automático)
```

**Opción B: A Record (si CNAME no está disponible)**
```
Tipo: A
Nombre: @ (o infieles)
Valor: [IP que Railway te proporcione]
TTL: 3600 (o automático)
```

### 3. Configurar en Firebase (OBLIGATORIO)

**IMPORTANTE:** Debes agregar el dominio a Firebase para que la autenticación funcione.

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **infieles-29223**
3. Ve a **Authentication** → **Settings**
4. Busca la sección **"Authorized domains"**
5. Haz clic en **"Add domain"**
6. Ingresa: `infieles.website`
7. Haz clic en **"Add"**

### 4. Verificar Configuración

1. Espera 5-10 minutos para que los cambios DNS se propaguen
2. Verifica que el dominio funcione: `https://infieles.website`
3. Verifica que el login con Google funcione correctamente

## ✅ Dominios que Deben Estar en Firebase

Asegúrate de tener estos dominios en la lista de autorizados:

- ✅ `localhost` (ya incluido por defecto)
- ✅ `ladys-production.up.railway.app` (dominio de Railway)
- ✅ `infieles.website` (tu dominio personalizado)

## 🔍 Verificar DNS

Puedes verificar que el DNS está configurado correctamente usando:

```bash
# Verificar CNAME
nslookup infieles.website

# O usar herramientas online:
# - https://dnschecker.org
# - https://www.whatsmydns.net
```

## ⚠️ Problemas Comunes

### El dominio no carga
- Verifica que el DNS esté configurado correctamente
- Espera hasta 24 horas para la propagación completa
- Verifica que Railway muestre el dominio como "Active"

### Error de autenticación
- Asegúrate de haber agregado `infieles.website` en Firebase
- Verifica que el dominio esté en la lista de "Authorized domains"
- Espera unos minutos después de agregarlo

### Certificado SSL
- Railway configura automáticamente SSL/HTTPS
- Puede tardar unos minutos después de configurar el dominio
- Verifica que el certificado esté activo en Railway Dashboard

## 📝 Notas

- El dominio personalizado reemplazará al dominio de Railway (`ladys-production.up.railway.app`)
- Puedes usar ambos dominios simultáneamente
- Railway redirige automáticamente el tráfico HTTPS
- No necesitas configurar nada adicional en el código

