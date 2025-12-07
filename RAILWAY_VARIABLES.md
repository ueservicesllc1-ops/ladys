# 🔧 Variables de Entorno para Railway

## 📋 Variables Obligatorias

### Backblaze B2 (Almacenamiento de Fotos)

```json
{
  "B2_KEY_ID": "005c2b526be0baa0000000026",
  "B2_APPLICATION_KEY": "K005jZQmHXremE1cYJUNwzK0lajLXZo",
  "B2_BUCKET_NAME": "infieles",
  "B2_ENDPOINT": "https://s3.us-east-005.backblazeb2.com",
  "B2_REGION": "us-east-005",
  "B2_PUBLIC_FILE_ID": "f005"
}
```

### Firebase/Firestore (Base de Datos y Autenticación)

```json
{
  "VITE_FIREBASE_API_KEY": "AIzaSyCTMcvvzi7q0lgDm2NfEa4OTDdbh9_iKzE",
  "VITE_FIREBASE_AUTH_DOMAIN": "infieles-29223.firebaseapp.com",
  "VITE_FIREBASE_PROJECT_ID": "infieles-29223",
  "VITE_FIREBASE_STORAGE_BUCKET": "infieles-29223.firebasestorage.app",
  "VITE_FIREBASE_MESSAGING_SENDER_ID": "588069651968",
  "VITE_FIREBASE_APP_ID": "1:588069651968:web:c671adbbbf1af13dbc3ae5",
  "VITE_FIREBASE_MEASUREMENT_ID": "G-6GNBHWCNKQ"
}
```

**Nota:** Todas las variables de Firebase deben comenzar con `VITE_` para que Vite las incluya en el build del cliente.

## 🔐 Variables Opcionales (Firebase Admin SDK)

**Solo si quieres usar la gestión de usuarios en el panel de admin:**

### Opción 1: Variable de Entorno JSON (Recomendado)

1. Abre tu archivo `serviceAccountKey.json`
2. Conviértelo a una sola línea (sin saltos de línea)
3. Agrega esta variable en Railway:

```json
{
  "FIREBASE_SERVICE_ACCOUNT": "{\"type\":\"service_account\",\"project_id\":\"infieles-29223\",\"private_key_id\":\"...\",\"private_key\":\"...\",\"client_email\":\"...\",\"client_id\":\"...\",\"auth_uri\":\"...\",\"token_uri\":\"...\",\"auth_provider_x509_cert_url\":\"...\",\"client_x509_cert_url\":\"...\"}"
}
```

**Nota:** Reemplaza los `...` con los valores reales de tu `serviceAccountKey.json`, todo en una sola línea.

### Opción 2: Sin Firebase Admin

Si no necesitas la gestión de usuarios, simplemente **NO agregues** la variable `FIREBASE_SERVICE_ACCOUNT`. La app funcionará normalmente, solo que el panel de admin no podrá listar/eliminar usuarios.

## 📝 Cómo Agregar en Railway

1. Ve a tu proyecto en Railway
2. Haz clic en **Variables** (en el menú lateral)
3. Haz clic en **+ New Variable**
4. Para cada variable:
   - **Name**: El nombre de la variable (ej: `B2_KEY_ID`)
   - **Value**: El valor (ej: `005c2b526be0baa0000000026`)
5. Repite para todas las variables

O puedes usar el formato JSON arriba y copiar cada par clave-valor.

## ✅ Variables Mínimas Requeridas

Para que la app funcione básicamente, solo necesitas estas 6 variables de Backblaze B2:

- `B2_KEY_ID`
- `B2_APPLICATION_KEY`
- `B2_BUCKET_NAME`
- `B2_ENDPOINT`
- `B2_REGION`
- `B2_PUBLIC_FILE_ID`

El puerto (`PORT`) se asigna automáticamente por Railway, no necesitas configurarlo.

