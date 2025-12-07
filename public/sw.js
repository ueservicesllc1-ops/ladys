// Service Worker para PWA
const CACHE_NAME = 'infieles-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/ico.jpg',
  '/logo.jpg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia: Network First, luego Cache
self.addEventListener('fetch', (event) => {
  // No cachear peticiones POST, PUT, DELETE, ni rutas de API
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return; // Dejar que la petición pase sin cachear
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Solo cachear respuestas exitosas y que sean GET
        if (response.status === 200 && event.request.method === 'GET') {
          // Clonar la respuesta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

