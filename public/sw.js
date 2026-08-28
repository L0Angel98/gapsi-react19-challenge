const CACHE = 'gapsi-react19-v4';
const STATIC_ASSETS = ['/', '/manifest.webmanifest', '/brand/logo.png', '/brand/logoBlanco.png', '/brand/icon.png', '/gapsi-logo.svg', '/pwa-icon-192.svg', '/pwa-icon-512.svg'];
const MAX_CACHEABLE_BYTES = 2_000_000;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('gapsi-react19-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.search) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const contentLength = Number(response.headers.get('content-length') ?? '0');
        if (!response.ok || (contentLength > 0 && contentLength > MAX_CACHEABLE_BYTES)) return response;
        const copy = response.clone();
        void caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});

