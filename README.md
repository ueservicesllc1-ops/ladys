# Infieles App - Aplicación de Personas

Una aplicación web moderna y mobile-first para gestionar un listado de personas con sus fotos y redes sociales, conectada a Firebase.

## Características

- **Diseño Mobile-First**: Optimizada para dispositivos móviles
- **Interfaz Moderna**: Diseño hermoso con efectos y animaciones sorprendentes
- **Firebase Integration**: Firestore para datos de personas
- **Backblaze B2**: Almacenamiento de fotos en B2 con S3 API
- **Galería de Fotos**: Múltiples fotos por persona con navegación
- **Redes Sociales**: Enlaces opcionales a Instagram, Facebook, Twitter y Web
- **Rendimiento**: Construida con React y Vite para máxima velocidad

## Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar Firebase:**
   - La configuración de Firebase ya está lista en `src/firebase/config.js`
   - Solo necesitas configurar las reglas de Firestore (ver paso 3)

3. **Configurar reglas de Firestore:**
   En Firebase Console > Firestore Database > Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /persons/{document=**} {
      allow read, write: if true; // Cambia esto según tus necesidades de seguridad
    }
  }
}
```

4. **Servidor Proxy para B2:**
   - Ya está configurado y listo para usar
   - El servidor proxy maneja las subidas a Backblaze B2
   - **NO necesitas configurar CORS en B2** - el proxy lo maneja
   - Consulta `B2_CORS_SETUP.md` para más detalles

## Ejecutar la aplicación

**Modo desarrollo (ejecuta servidor proxy + cliente):**
```bash
npm run dev
```

Esto iniciará:
- **Servidor proxy** en `http://localhost:3001` (maneja subidas a B2)
- **Cliente Vite** en `http://localhost:5173` (la app web)

**Ejecutar por separado:**
```bash
# Terminal 1 - Servidor proxy
npm run dev:server

# Terminal 2 - Cliente
npm run dev:client
```

**Compilar para producción:**
```bash
npm run build
```

**Previsualizar build de producción:**
```bash
npm run preview
```

## Empaquetar como App Móvil

Para convertir esta web app en una app móvil, puedes usar:

### **Capacitor** (Recomendado)
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
npx cap add ios
npx cap add android
npm run build
npx cap sync
npx cap open ios  # o android
```

### **PWA** (Progressive Web App)
La app ya está configurada para funcionar como PWA. Solo necesitas:
1. Agregar un manifest.json
2. Agregar un service worker
3. Instalar desde el navegador móvil

## Tecnologías Utilizadas

- **React 18**: Framework de UI
- **Vite**: Build tool ultra rápido
- **Firebase Firestore**: Base de datos para información de personas
- **Backblaze B2**: Almacenamiento de fotos (compatible con S3 API)
- **Express**: Servidor proxy para manejar subidas a B2
- **AWS SDK S3**: Cliente para subir archivos a B2 desde el servidor
- **Multer**: Manejo de archivos multipart
- **Framer Motion**: Animaciones fluidas
- **Tailwind CSS**: Estilos modernos
- **React Router**: Navegación
- **Lucide React**: Iconos

## Uso

1. **Agregar Persona**: Toca el botón flotante "+" en la lista principal
2. **Ver Detalles**: Toca cualquier persona en la lista para ver sus fotos
3. **Navegar Fotos**: Desliza o usa los botones para cambiar entre fotos
4. **Redes Sociales**: Toca los botones de redes sociales para abrir los enlaces

## Características de Diseño

- Gradientes animados de fondo
- Efectos de glassmorphism (vidrio esmerilado)
- Animaciones suaves con Framer Motion
- Transiciones fluidas entre pantallas
- Diseño responsive y táctil
- Indicadores visuales interactivos

## Estructura del Proyecto

```
infieles/
├── src/
│   ├── components/
│   │   ├── PersonList.jsx      # Lista de personas
│   │   ├── PersonDetail.jsx    # Detalle y galería
│   │   └── AddPersonForm.jsx   # Formulario de agregar
│   ├── firebase/
│   │   ├── config.js           # Configuración Firebase
│   │   └── persons.js          # Funciones de Firebase
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Punto de entrada
│   └── index.css               # Estilos globales
├── package.json
└── vite.config.js
```

## Seguridad

> **Importante**: Las reglas de Firestore y Storage en este ejemplo permiten lectura/escritura pública. Para producción, implementa autenticación y reglas de seguridad apropiadas.

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

