const CACHE_NAME = 'jwithkp-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.min.css',
  '/js/script.min.js',
  '/Logo.webp',
  '/Logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate: serve cache, refresh in background
        event.waitUntil(
          fetch(event.request).then((res) => {
            if (res && res.status === 200) {
              return caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res));
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }
      // Not cached yet: fetch, cache for next visit, and return
      return fetch(event.request).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      });
    })
  );
});
