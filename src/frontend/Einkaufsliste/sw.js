self.addEventListener('install', event => {
  console.log('[Service Worker] Installiert');
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
