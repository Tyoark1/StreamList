const CACHE_NAME = 'streamlist-static-v1';
const DYNAMIC_CACHE = 'streamlist-api-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// CAPSTONE: SERVICE_WORKER_FETCH
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Checks if the request is an API call (Backend or TMDB)
  if (url.origin.includes('localhost:8000') || url.origin.includes('api.themoviedb.org')) {
    event.respondWith(
      // Network-first strategy: Tries the live server first, clones the response to the dynamic cache, 
      // and falls back to the cache if the user is offline.
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first strategy for static UI assets
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});