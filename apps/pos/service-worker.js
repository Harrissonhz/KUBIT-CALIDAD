var CACHE = 'kubit-pos-v4';

var ASSETS = [
  'index.html',
  'login.html',
  'ventas.html',
  'ventas-rapido.html',
  'ventas-historial.html',
  'caja.html',
  'productos.html',
  'categorias.html',
  'inventario.html',
  'clientes.html',
  'proveedores.html',
  'compras.html',
  'facturacion.html',
  'gastos.html',
  'configuracion.html',
  'reportes.html',
  'factura-print.html',
  'css/estilo.css',
  'js/config.js',
  'js/supabase.js',
  'js/compartido/database.js',
  'js/compartido/auth.js',
  'js/paginas/ventas.js',
  'js/paginas/caja.js',
  'js/paginas/productos.js',
  'js/paginas/categorias.js',
  'js/paginas/inventario.js',
  'js/paginas/clientes.js',
  'js/paginas/proveedores.js',
  'js/paginas/compras.js',
  'js/paginas/facturacion.js',
  'js/paginas/gastos.js',
  'js/paginas/configuracion.js',
  'js/paginas/reportes.js',
  'js/paginas/login.js',
  'js/paginas/ventas-historial.js',
  'js/paginas/ventas-rapido.js',
  'img/icon.svg',
  'manifest.json',
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (r) {
      if (r && !r.redirected) return r;
      return fetch(e.request, { redirect: 'follow' });
    })
  );
});
