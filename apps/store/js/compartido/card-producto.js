function obtenerBadges(producto) {
  const badges = [];
  const tags = producto.tags || [];

  const badgeMap = {
    'nuevo':         { tipo: 'nuevo',        texto: 'Nuevo' },
    'destacado':     { tipo: 'destacado',    texto: 'Destacado' },
    'mas_vendido':   { tipo: 'mas-vendido',  texto: 'Más Vendido' },
    'liquidacion':   { tipo: 'liquidacion',  texto: 'Liquidación' },
    'imperdible':    { tipo: 'imperdible',   texto: 'Imperdible' },
  };

  const ofertaTags = ['oferta', 'super-oferta', 'remate'];

  const tieneVariantes = (producto.variantes || []).length > 0;
  const stockTotal = tieneVariantes
    ? (producto.variantes || []).reduce((sum, v) => sum + (v.stock || 0), 0)
    : -1;

  if (stockTotal === 0 || tags.includes('agotado')) {
    badges.push({ tipo: 'agotado', texto: 'Agotado' });
    return badges;
  }

  for (const tag of tags) {
    if (badgeMap[tag]) badges.push(badgeMap[tag]);
  }

  if (tags.some(t => ofertaTags.includes(t))) {
    badges.push({ tipo: 'oferta', texto: 'Oferta' });
  }

  return badges;
}

function renderBadge(badge) {
  const map = {
    'nuevo':       { icon: '🆕', cls: 'badge-nuevo' },
    'destacado':   { icon: '★',  cls: 'badge-destacado' },
    'oferta':      { icon: '🔥', cls: 'badge-oferta' },
    'mas-vendido': { icon: '⭐', cls: 'badge-mas-vendido' },
    'liquidacion': { icon: '⚡', cls: 'badge-liquidacion' },
    'imperdible':  { icon: '💎', cls: 'badge-imperdible' },
    'agotado':     { icon: '—',  cls: 'badge-agotado' },
  };
  const m = map[badge.tipo] || { icon: '', cls: 'badge' };
  return `<span class="badge ${m.cls}">${m.icon} ${badge.texto}</span>`;
}

function CardProducto(producto) {
  const $div = document.createElement('div');
  $div.className = 'product-card';
  const $inner = document.createElement('div');
  $inner.className = 'bg-white rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ease-out card-producto animate-fadeInUp';
  $div.appendChild($inner);

  const badges = obtenerBadges(producto);
  const badgesHtml = badges.length
    ? `<div class="absolute top-2 left-2 flex flex-col gap-1.5 z-10">${badges.map(renderBadge).join('')}</div>`
    : '';

  $inner.innerHTML = `
    <a href="producto.html?slug=${producto.slug}" class="block relative">
      <div class="aspect-square bg-gray-50 overflow-hidden">
        <img src="${producto.imagen}" alt="${producto.nombre}"
             class="w-full h-full object-cover transition-transform duration-300"
             loading="lazy">
      </div>
      ${badgesHtml}
    </a>
    <div class="p-3">
      <a href="producto.html?slug=${producto.slug}">
        <h3 class="text-sm font-medium text-slate-900 leading-tight truncate hover:underline">${producto.nombre}</h3>
      </a>
      <p class="text-sm mt-1">${renderPrecio(producto)}</p>
      <button class="btn-agregar mt-2 w-full py-2 text-sm font-medium bg-slate-950 text-white rounded-md hover:bg-slate-800 transition-colors"
              data-producto-id="${producto.id}"
              data-producto-nombre="${producto.nombre}"
              data-producto-precio="${producto.precio}"
              data-producto-imagen="${producto.imagen}">
        Agregar
      </button>
    </div>
  `;

  $inner.querySelector('.btn-agregar').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    agregarAlCarrito(producto);
  });

  return $div;
}

function agregarAlCarrito(producto) {
  const carrito = JSON.parse(localStorage.getItem('kubit_carrito') || '[]');
  const existente = carrito.find(item => item.productoId === producto.id);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1
    });
  }

  localStorage.setItem('kubit_carrito', JSON.stringify(carrito));
  actualizarBadgeCarrito();

  Modal({
    titulo: 'Agregado al carrito',
    contenido: `
      <div class="flex items-center gap-3 mb-4">
        <img src="${producto.imagen}" alt="${producto.nombre}" class="w-14 h-14 rounded-lg object-cover bg-gray-100">
        <div>
          <p class="text-sm font-medium text-slate-900">${producto.nombre}</p>
          <p class="text-sm text-slate-500">${formatearMoneda(producto.precio)}</p>
        </div>
      </div>
      <a href="carrito.html" class="block w-full text-center px-4 py-2 text-sm font-medium bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors mb-2">Ir al carrito</a>
      <a href="index.html" class="block w-full text-center px-4 py-2 text-sm font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Seguir comprando</a>
    `
  });
}
