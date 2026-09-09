const CACHE = 'sahay-v3';
const PRECACHE = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => k !== CACHE)
            .map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  if (
    request.mode === 'navigate' ||
    request.destination === 'document'
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put('./index.html', copy))
            .catch(() => {});

          return response;
        })
        .catch(() => caches.match('./index.html'))
    );

    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) return cached;

        return fetch(request).then(response => {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => cache.put(request, copy))
            .catch(() => {});

          return response;
        });
      })
  );
});
