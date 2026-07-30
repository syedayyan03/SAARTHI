const CACHE_NAME = 'saarthi-pwa-cache-v8';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/disease.html',
  '/crop.html',
  '/market.html',
  '/chat.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/disease.js',
  '/img/saarthi-logo.png'
];

// Install Service Worker and cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA] Caching offline shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[PWA] Clearing obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch events: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Do not intercept or cache API requests
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response and cache it
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network is unavailable
        return caches.match(event.request);
      })
  );
});
