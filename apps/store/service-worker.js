const CACHE = 'outletshop-v1';

const ASSETS = [
  'index.html',
  'producto.html',
  'css/estilo.css',
  'js/api/supabase-client.js',
  'js/api/productos.js',
  'js/api/categorias.js',
  'js/compartido/utils.js',
  'js/compartido/modal.js',
  'js/compartido/card-producto.js',
  'js/compartido/navbar-store.js',
  'js/paginas/inicio.js',
  'js/paginas/producto.js',
  'img/LogoTodasPublicaciones.jpg',
  'manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
