# Configuración Completa - Infieles App

## Estado Actual

Tu aplicación está **completamente configurada** y lista para usar:

- **Firebase Firestore**: Configurado con tus credenciales
- **Backblaze B2**: Configurado con tus credenciales
- **Código de subida**: Implementado usando AWS SDK S3 (compatible con B2)
- **Proxy CORS**: Configurado en Vite (opcional)

## Servidor Proxy Configurado

**Ya NO necesitas configurar CORS en B2.** Hemos creado un servidor proxy que maneja las subidas.

El servidor proxy:
- Recibe las fotos del navegador
- Las sube a Backblaze B2 usando S3 API
- Retorna las URLs públicas
- Maneja CORS automáticamente

## Ejecutar la Aplicación

```bash
npm install
npm run dev
```

Esto ejecutará:
- **Servidor proxy** en `http://localhost:3001` (maneja subidas a B2)
- **Cliente** en `http://localhost:5173` (la app web)

La app estará disponible en: `http://localhost:5173`

## Flujo de Trabajo

1. **Agregar Persona:**
   - Toca el botón "+" flotante
   - Completa el formulario (nombre, apellido, país, ciudad)
   - Agrega enlaces de redes sociales (opcional)
   - Selecciona una o más fotos
   - Guarda

2. **Ver Personas:**
   - La lista principal muestra todas las personas
   - Toca cualquier persona para ver sus fotos

3. **Ver Fotos:**
   - En la vista de detalle, puedes navegar entre fotos
   - Usa los botones o desliza para cambiar de foto

## Solución de Problemas

### Error: "CORS policy" al subir fotos
**Solución**: Asegúrate de que el servidor proxy esté corriendo. El proxy maneja CORS automáticamente.

### Error: "Access Denied" al subir
**Solución**: Verifica que las credenciales de B2 en las variables de entorno o en `server/proxy.js` (valores por defecto) sean correctas

### Las fotos no se muestran
**Solución**: 
- Verifica que el bucket sea público
- Revisa la consola del navegador para ver errores
- Verifica que las URLs generadas sean correctas

### Error: "Buffer is not defined"
**Solución**: Ya está solucionado usando Uint8Array en lugar de Buffer

## Estructura de Archivos

```
infieles/
├── server/
│   └── proxy.js           # Servidor proxy para B2 (maneja subidas)
├── src/
│   ├── b2/
│   │   └── upload.js      # Cliente que usa el proxy
│   ├── firebase/
│   │   ├── config.js      # Configuración de Firebase (YA CONFIGURADO)
│   │   └── persons.js     # Funciones de Firestore
│   └── components/
│       ├── PersonList.jsx     # Lista de personas
│       ├── PersonDetail.jsx  # Detalle y galería
│       └── AddPersonForm.jsx # Formulario de agregar
└── vite.config.js         # Configuración de proxy de Vite
```

## Seguridad

> **Nota de Seguridad**: 
- Las credenciales de B2 están en el servidor proxy (más seguro)
- El servidor proxy maneja CORS automáticamente
- Para producción:
  - **USA VARIABLES DE ENTORNO** para las credenciales de B2
  - NO subas el archivo `.env` a tu repositorio
  - Limita los orígenes permitidos en CORS solo a tus dominios
  - Considera implementar autenticación si es necesario

## Documentación Adicional

- `README.md` - Documentación general
- `B2_CORS_SETUP.md` - Guía detallada de CORS

## Características Implementadas

- Diseño mobile-first hermoso
- Animaciones sorprendentes con Framer Motion
- Subida múltiple de fotos a B2
- Galería de fotos navegable
- Redes sociales opcionales
- Integración completa con Firebase y B2

¡Tu app está lista para usar!

