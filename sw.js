// Service Worker for 老师的小能手 PWA
const CACHE_NAME = 'laoshizhushou-v5';

self.addEventListener('install', event => {
  // Don't pre-cache, just activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network-first for everything, cache as fallback
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => {
      return caches.match(event.request).then(cached => {
        return cached || (event.request.mode === 'navigate' ? caches.match('./chat.html') : undefined);
      });
    })
  );
});
