const CACHE_NAME = 'agroconnect-v2'; // 🔥 CHANGE VERSION EVERY BUILD

self.addEventListener('install', (event) => {
  self.skipWaiting(); // 🔥 immediately activate new SW
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // 🔥 delete all old caches
          }
        })
      );
    })
  );
  self.clients.claim(); // 🔥 take control immediately
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
