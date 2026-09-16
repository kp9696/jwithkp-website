const CACHE_NAME = 'jwithkp-f7362882af';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.ea3223258d.min.css',
  '/js/script.2d10d1b131.min.js',
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

  // Page navigations: network-first. A cache-first strategy here would show
  // every returning visitor the pre-deploy version of a page on their very
  // first load after a release, with no natural moment where the fresh copy
  // appears. Only fall back to the cache (then the cached homepage) if the
  // network is genuinely unreachable.
  const isNavigation = event.request.mode === 'navigate' ||
    (event.request.destination === '' && (event.request.headers.get('accept') || '').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Static assets (CSS/JS/images/fonts): cache-first with background
  // revalidation, since these change less often and instant-from-cache is
  // the right trade-off here.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
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
