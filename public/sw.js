// PokédeX v1.3.5 Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal fetch handler to allow for PWA installation without aggressive caching
// This prevents the "Stuck Spinner" and "Retry" issues on mobile entry
self.addEventListener('fetch', (event) => {
  // We let the server handle the logic for root and auth paths
  if (event.request.mode === 'navigate') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
