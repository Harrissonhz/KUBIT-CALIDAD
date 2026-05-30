var CACHE_NAME = 'kubit-pos-v1';
var urlsToCache = [
  '/apps/pos/ventas.html',
  '/apps/pos/login.html',
  '/apps/pos/css/estilo.css',
  '/apps/pos/js/paginas/ventas.js',
  '/apps/pos/js/paginas/login.js',
  '/apps/pos/manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (name) {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
});
