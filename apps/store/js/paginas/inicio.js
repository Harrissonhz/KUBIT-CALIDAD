var POR_PAGINA = 20;
var intervaloCarousel = null;

document.addEventListener('DOMContentLoaded', async () => {
  var categoriaSlug = obtenerParametroURL('categoria');
  var query = obtenerParametroURL('q');
  var pagina = parseInt(obtenerParametroURL('pagina'), 10) || 1;

  var [destacados, categorias] = await Promise.all([
    StoreAPI.productos.obtenerDestacados(3),
    StoreAPI.categorias.obtenerTodas()
  ]);

  var menuActivo = categoriaSlug === 'todos' || (!categoriaSlug && !query) ? 'todos' : (categoriaSlug || '');
  renderizarCarousel(destacados);
  renderizarMenuCategorias(categorias, menuActivo);

  var filtros = {};
  if (categoriaSlug && categoriaSlug !== 'todos') filtros.categoria = categoriaSlug;
  if (query) filtros.query = query;

  var resultado = await StoreAPI.productos.obtenerPaginados(pagina, POR_PAGINA, filtros);

  var cat = null;
  if (categoriaSlug) {
    for (var i = 0; i < categorias.length; i++) {
      if (categorias[i].slug === categoriaSlug) { cat = categorias[i]; break; }
    }
  }
  var titulo = query ? 'Resultados para "' + query + '"' : (cat ? cat.nombre : 'Productos');

  renderizarProductos(resultado.productos);
  actualizarCabecera(titulo, resultado.total);
  renderizarPaginacion(resultado.total, resultado.pagina, resultado.totalPaginas, filtros);
});

function renderizarCarousel(destacados) {
  const $slides = document.getElementById('carousel-slides');
  const $dots = document.getElementById('carousel-dots');
  if (!$slides) return;

  if (!destacados || !destacados.length) { $slides.innerHTML = ''; return; }

  $slides.innerHTML = destacados.map(p => `
    <div class="carousel-slide" style="background-image:url('${p.imagen}')">
      <div class="carousel-content">
        <h2>${p.nombre}</h2>
        ${p.descripcion_corta ? `<p class="carousel-desc">${p.descripcion_corta}</p>` : ''}
        <div class="carousel-price">${renderPrecio(p)}</div>
        <a href="producto.html?slug=${p.slug}" class="carousel-link">Ver producto</a>
      </div>
    </div>
  `).join('');

  $dots.innerHTML = destacados.map((_, i) => `
    <button class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>
  `).join('');

  var indice = 0;
  var totalSlides = destacados.length;

  function irASlide(index) {
    indice = ((index % totalSlides) + totalSlides) % totalSlides;
    $slides.style.transform = `translateX(-${indice * 100}%)`;
    document.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === indice);
    });
  }

  function iniciarAutoPlay() {
    detenerAutoPlay();
    intervaloCarousel = setInterval(() => irASlide(indice + 1), 5000);
  }

  function detenerAutoPlay() {
    if (intervaloCarousel) { clearInterval(intervaloCarousel); intervaloCarousel = null; }
  }

  $dots.addEventListener('click', (e) => {
    const btn = e.target.closest('.carousel-dot');
    if (!btn) return;
    detenerAutoPlay();
    irASlide(parseInt(btn.dataset.index, 10));
    iniciarAutoPlay();
  });

  document.querySelector('.carousel-prev')?.addEventListener('click', () => {
    detenerAutoPlay();
    irASlide(indice - 1);
    iniciarAutoPlay();
  });

  document.querySelector('.carousel-next')?.addEventListener('click', () => {
    detenerAutoPlay();
    irASlide(indice + 1);
    iniciarAutoPlay();
  });

  var $carousel = document.getElementById('hero-carousel');
  $carousel.addEventListener('mouseenter', detenerAutoPlay);
  $carousel.addEventListener('mouseleave', iniciarAutoPlay);

  iniciarAutoPlay();
}

function renderizarMenuCategorias(categorias, activo) {
  const $menu = document.getElementById('menu-categorias');
  if (!$menu) return;

  const todas = categorias.filter(c => c.slug !== 'todos');
  var html = `<a href="?categoria=todos" class="cat-link${activo === 'todos' ? ' active' : ''}">Todos</a>`;
  html += todas.map(c => `
    <a href="?categoria=${c.slug}" class="cat-link${c.slug === activo ? ' active' : ''}">${c.nombre}</a>
  `).join('');

  $menu.innerHTML = html;
}

function renderizarProductos(productos) {
  const $grid = document.getElementById('grid-productos');
  if (!$grid) return;

  $grid.innerHTML = '';
  if (productos.length === 0) {
    $grid.innerHTML = '<p class="text-sm text-slate-500 text-center py-12" style="font-size:14px">No hay productos</p>';
    return;
  }
  productos.forEach(p => $grid.appendChild(CardProducto(p)));
}

function actualizarCabecera(titulo, total) {
  const $titulo = document.getElementById('titulo-productos');
  const $contador = document.getElementById('contador-productos');
  if ($titulo) $titulo.textContent = titulo;
  if ($contador) $contador.textContent = `${total} producto${total !== 1 ? 's' : ''}`;
}

function renderizarPaginacion(total, pagina, totalPaginas, filtros) {
  const $wrapper = document.getElementById('paginacion');
  if (!$wrapper) return;

  if (totalPaginas <= 1) { $wrapper.innerHTML = ''; return; }

  var params = new URLSearchParams(window.location.search);
  params.delete('pagina');
  var paramStr = params.toString();
  var urlPrefix = paramStr ? '?' + paramStr + '&pagina=' : '?pagina=';

  var botones = [];
  var prevPagina = pagina - 1;
  botones.push(`<button class="page-btn" data-pagina="${prevPagina}"${pagina <= 1 ? ' disabled' : ''}>&laquo;</button>`);

  var rInicio = Math.max(1, pagina - 2);
  var rFin = Math.min(totalPaginas, pagina + 2);

  if (rInicio > 1) {
    botones.push(`<a href="${urlPrefix}1" class="page-btn">1</a>`);
    if (rInicio > 2) botones.push('<span class="text-slate-400 text-xs px-1">...</span>');
  }

  for (var i = rInicio; i <= rFin; i++) {
    botones.push(`<a href="${urlPrefix}${i}" class="page-btn${i === pagina ? ' active' : ''}">${i}</a>`);
  }

  if (rFin < totalPaginas) {
    if (rFin < totalPaginas - 1) botones.push('<span class="text-slate-400 text-xs px-1">...</span>');
    botones.push(`<a href="${urlPrefix}${totalPaginas}" class="page-btn">${totalPaginas}</a>`);
  }

  var nextPagina = pagina + 1;
  botones.push(`<button class="page-btn" data-pagina="${nextPagina}"${pagina >= totalPaginas ? ' disabled' : ''}>&raquo;</button>`);

  $wrapper.innerHTML = botones.join('');

  $wrapper.querySelectorAll('button.page-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var p = parseInt(this.dataset.pagina, 10);
      if (p < 1 || p > totalPaginas) return;
      var url = new URL(window.location);
      url.searchParams.set('pagina', p);
      window.location.href = url.pathname + url.search;
    });
  });
}
