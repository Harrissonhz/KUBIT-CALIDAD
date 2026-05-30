document.addEventListener('DOMContentLoaded', async () => {
  var slug = obtenerParametroURL('slug');
  if (!slug) {
    document.getElementById('contenedor-producto').innerHTML = '\
      <div class="col-span-full text-center py-16">\
        <p class="text-slate-500 text-lg">Producto no encontrado</p>\
        <a href="index.html" class="inline-block mt-4 text-sm text-slate-950 underline">Volver a la tienda</a>\
      </div>\
    ';
    return;
  }

  var producto = await StoreAPI.productos.obtenerPorSlug(slug);
  if (!producto) {
    document.getElementById('contenedor-producto').innerHTML = '\
      <div class="col-span-full text-center py-16">\
        <p class="text-slate-500 text-lg">Producto no encontrado</p>\
        <a href="index.html" class="inline-block mt-4 text-sm text-slate-950 underline">Volver a la tienda</a>\
      </div>\
    ';
    return;
  }

  await renderizarProducto(producto);
  await renderizarRelacionados(producto);
});

async function renderizarProducto(producto) {
  var categoria = await StoreAPI.categorias.obtenerPorSlug(producto.categoria);

  document.title = `${producto.nombre} - OutletShop`;

  document.getElementById('breadcrumb').innerHTML = `
    <a href="index.html" class="hover:text-slate-950 transition-colors">Inicio</a>
    <span>/</span>
    <a href="?categoria=${producto.categoria}" class="hover:text-slate-950 transition-colors">${categoria?.nombre || producto.categoria}</a>
    <span class="text-slate-600">/</span>
    <span class="text-slate-600">${producto.nombre}</span>
  `;

  const imgPrincipal = document.getElementById('img-principal');
  imgPrincipal.src = producto.imagen;
  imgPrincipal.alt = producto.nombre;

  const $thumbnails = document.getElementById('thumbnails');
  const todasImagenes = [producto.imagen, ...(producto.imagenes || [])].filter((v, i, a) => a.indexOf(v) === i);
  if (todasImagenes.length > 1) {
    $thumbnails.innerHTML = todasImagenes.map((img, i) => `
      <button class="w-16 h-16 shrink-0 rounded-lg border-2 overflow-hidden transition-all hover:border-slate-950 ${i === 0 ? 'border-slate-950' : 'border-slate-200'}"
              data-img="${img}">
        <img src="${img}" alt="" class="w-full h-full object-cover" loading="lazy">
      </button>
    `).join('');

    $thumbnails.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn || btn.dataset.img === undefined) return;
      document.querySelectorAll('#thumbnails button').forEach(b => b.classList.remove('border-slate-950'));
      btn.classList.add('border-slate-950');
      imgPrincipal.src = btn.dataset.img;
    });
  }

  if (producto.videos && producto.videos.length > 0) {
    var posicion = Math.min(2, $thumbnails.children.length);
    producto.videos.forEach(function(videoId) {
      var btn = document.createElement('button');
      btn.className = 'video-thumb-wrapper w-16 h-16 shrink-0 rounded-lg border-2 border-slate-200 overflow-hidden';
      btn.innerHTML = '<img src="https://img.youtube.com/vi/' + videoId + '/default.jpg" alt="" class="w-full h-full object-cover" loading="lazy">' +
        '<svg class="video-play-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      btn.addEventListener('click', function() {
        abrirVideoModal(videoId);
      });
      var ref = $thumbnails.children[posicion];
      if (ref) {
        $thumbnails.insertBefore(btn, ref);
        posicion++;
      } else {
        $thumbnails.appendChild(btn);
      }
    });
  }

  document.getElementById('producto-categoria').textContent = categoria?.nombre || producto.categoria;
  document.getElementById('producto-nombre').textContent = producto.nombre;
  document.getElementById('producto-precio').innerHTML = renderPrecio(producto);
  document.getElementById('producto-descripcion').textContent = producto.descripcion_larga;

  if (producto.variantes && producto.variantes.length > 0) {
    const $variantes = document.getElementById('producto-variantes');
    const $lista = document.getElementById('variantes-lista');
    $variantes.classList.remove('hidden');

    let seleccionada = null;
    $lista.innerHTML = producto.variantes.map((v, i) => `
      <button class="px-4 py-2 text-sm rounded-lg border transition-all
        ${i === 0 ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-950'}"
        data-variante-id="${v.id}" data-variante-nombre="${v.nombre}">
        ${v.nombre} ${v.stock <= 5 ? '<span class="text-red-400 text-[10px] ml-1">¡Últimos!</span>' : ''}
      </button>
    `).join('');
    seleccionada = producto.variantes[0].id;

    $lista.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      document.querySelectorAll('#variantes-lista button').forEach(b => {
        b.classList.remove('border-slate-950', 'bg-slate-950', 'text-white');
        b.classList.add('border-slate-200', 'text-slate-600');
      });
      btn.classList.remove('border-slate-200', 'text-slate-600');
      btn.classList.add('border-slate-950', 'bg-slate-950', 'text-white');
      seleccionada = btn.dataset.varianteId;
    });

    document.getElementById('btn-agregar').addEventListener('click', () => {
      const variante = producto.variantes.find(v => v.id === seleccionada);
      Modal({
        titulo: 'Agregado al carrito',
        contenido: `
          <p class="text-sm text-slate-600 mb-4">${producto.nombre}${variante ? ` — <span class="text-slate-950 font-medium">${variante.nombre}</span>` : ''}</p>
          <div class="flex items-center justify-between mb-4">
            <span class="text-lg font-bold text-slate-950">${renderPrecio(producto)}</span>
          </div>
          <a href="carrito.html" class="block w-full text-center px-4 py-2 text-sm font-medium bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors mb-2">Ir al carrito</a>
          <a href="index.html" class="block w-full text-center px-4 py-2 text-sm font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Seguir comprando</a>
        `
      });
    });
  } else {
    document.getElementById('btn-agregar').addEventListener('click', () => {
      Modal({
        titulo: 'Agregado al carrito',
        contenido: `
          <p class="text-sm text-slate-600 mb-4">${producto.nombre}</p>
          <div class="flex items-center justify-between mb-4">
            <span class="text-lg font-bold text-slate-950">${renderPrecio(producto)}</span>
          </div>
          <a href="carrito.html" class="block w-full text-center px-4 py-2 text-sm font-medium bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors mb-2">Ir al carrito</a>
          <a href="index.html" class="block w-full text-center px-4 py-2 text-sm font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Seguir comprando</a>
        `
      });
    });
  }

  const $especs = document.getElementById('especificaciones-lista');
  if (producto.especificaciones && producto.especificaciones.length > 0) {
    $especs.innerHTML = producto.especificaciones.map(e => `
      <div class="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
        <span class="text-sm text-slate-500">${e.nombre}</span>
        <span class="text-sm text-slate-950 font-medium">${e.valor}</span>
      </div>
    `).join('');
  }
}

function abrirVideoModal(videoId) {
  var overlay = document.createElement('div');
  overlay.className = 'video-modal-overlay';
  overlay.innerHTML = '<div class="video-modal-content">' +
    '<button class="video-modal-close">&times;</button>' +
    '<div class="video-container">' +
    '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>' +
    '</div></div>';

  overlay.querySelector('.video-modal-close').addEventListener('click', function() {
    overlay.remove();
  });

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

async function renderizarRelacionados(producto) {
  var relacionados = await StoreAPI.productos.obtenerRelacionados(producto, 4);
  if (!relacionados.length) return;

  document.getElementById('seccion-relacionados').classList.remove('hidden');
  const $grid = document.getElementById('grid-relacionados');
  relacionados.forEach(p => $grid.appendChild(CardProducto(p)));
}
