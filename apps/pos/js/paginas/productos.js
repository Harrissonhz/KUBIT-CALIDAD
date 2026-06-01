(function () {
  'use strict';

  var PRODUCTOS = [];
  var PRODUCTOS_FILTRADOS = [];
  var CATEGORIAS = [];
  var EDITANDO_ID = null;
  var EDITANDO_PRODUCTO_ID = null;
  var MULTIMEDIA = [];
  var MULTIMEDIA_ELIMINADOS = [];
  var _guardando = false;
  var PAGE_SIZE = 10;
  var PAGINA = 1;

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  /* ───────────────────────────────────────────────
     INIT
     ─────────────────────────────────────────────── */
  async function init() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');
    window.KubitAuth.cargarSesion();
    if (!window.KubitAuth.obtenerUsuario()) { window.location.href = 'login.html'; return; }
    window.KubitAuth.aplicarRestriccionesUI();

    await Promise.all([cargarCategorias(), cargarProductos()]);
    bindearEventos();
    agregarFilaMultimedia(); // una fila vacia por defecto
  }

  /* ───────────────────────────────────────────────
     CATEGORIAS
     ─────────────────────────────────────────────── */
  async function cargarCategorias() {
    var res = await DB.categorias.listarTodas();
    if (res.error) { console.error('[Productos] Error categorias:', res.error); return; }
    CATEGORIAS = res.data || [];

    [$('campo-categoria'), $('filtro-categoria')].forEach(function (sel) {
      sel.innerHTML = '<option value="">' + (sel.id === 'filtro-categoria' ? 'Todas las categorias' : 'Seleccionar...') + '</option>';
      CATEGORIAS.forEach(function (c) {
        sel.innerHTML += '<option value="' + c.id + '">' + c.nombre + '</option>';
      });
    });
  }

  /* ───────────────────────────────────────────────
     PRODUCTOS
     ─────────────────────────────────────────────── */
  function mostrarErrorTabla(msg) {
    var tbody = $('productos-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-10"><div class="flex flex-col items-center gap-2"><svg class="w-8 h-8 text-red-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg><p class="text-sm text-slate-400">' + msg + '</p></div></td></tr>';
  }

  async function cargarProductos() {
    $('productos-tbody').innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Cargando...</td></tr>';
    PAGINA = 1;
    var res = await DB.productos.listarConDetalle({ skipCache: true });
    if (res.error) {
      console.error('[Productos] Error:', res.error);
      mostrarErrorTabla('Error al cargar productos. Verifica tu conexion.');
      return;
    }
    PRODUCTOS = (res.data || []).map(function (d) {
      var p = d.producto || {};
      return {
        detalleId: d.id,
        productoId: p.id || d.producto_id,
        nombre: p.nombre || 'Sin nombre',
        categoriaId: p.categoria_id || null,
        categoriaNombre: (p.categoria && p.categoria.nombre) || '',
        codigoInterno: d.codigo_interno || '',
        codigoBarras: d.codigo_barras || '',
        marca: p.marca || '',
        modelo: p.modelo || '',
        tipoProducto: p.tipo_producto || '',
        descripcion: p.descripcion || '',
        precio: d.precio_venta || 0,
        precioCompra: d.precio_compra || 0,
        precioOriginal: d.precio_original || 0,
        precioMayorista: d.precio_mayorista || 0,
        descuentoMax: d.descuento_max || 0,
        margen: d.margen_ganancia || 0,
        stock: d.stock_actual || 0,
        stockMin: d.stock_min || 0,
        stockMax: d.stock_max || 0,
        peso: d.peso || null,
        dimensiones: d.dimensiones || '',
        activo: p.activo !== false,
        tags: p.tags || [],
        tasaImpuesto: p.tasa_impuesto || 0.19
      };
    });
    productosFiltrarYRender();
  }

  function renderizarPaginacion() {
    var total = PRODUCTOS_FILTRADOS.length;
    var paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (PAGINA > paginas) PAGINA = paginas;
    var desde = (PAGINA - 1) * PAGE_SIZE + 1;
    var hasta = Math.min(PAGINA * PAGE_SIZE, total);

    var info = $('pag-info');
    var ctrl = $('pag-controles');
    if (total === 0) {
      info.textContent = '0 resultados';
      ctrl.innerHTML = '';
      ctrl.classList.add('hidden');
      return;
    }
    ctrl.classList.remove('hidden');
    info.textContent = desde + '–' + hasta + ' de ' + total;

    var disabledPrev = PAGINA <= 1 ? ' opacity-30 pointer-events-none' : '';
    var disabledNext = PAGINA >= paginas ? ' opacity-30 pointer-events-none' : '';
    ctrl.innerHTML =
      '<button id="pag-prev" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' + disabledPrev + '">Anterior</button>' +
      '<span class="text-xs text-slate-400">' + PAGINA + ' / ' + paginas + '</span>' +
      '<button id="pag-next" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' + disabledNext + '">Siguiente</button>';
  }

  function renderizarTabla() {
    var tbody = $('productos-tbody');
    var total = PRODUCTOS_FILTRADOS.length;
    $('productos-count').textContent = '(' + total + ')';
    if (!total) {
      tbody.innerHTML = '';
      $('productos-empty').classList.remove('hidden');
      renderizarPaginacion();
      return;
    }
    $('productos-empty').classList.add('hidden');

    var inicio = (PAGINA - 1) * PAGE_SIZE;
    var pagina = PRODUCTOS_FILTRADOS.slice(inicio, inicio + PAGE_SIZE);

    tbody.innerHTML = pagina.map(function (p) {
      var agotado = p.stock <= 0;
      var bajo = p.stockMin > 0 && p.stock <= p.stockMin;
      var badge = agotado ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
        bajo ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      var badgeTxt = agotado ? 'Agotado' : bajo ? 'Bajo' : p.stock;
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-2"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">' + p.nombre.charAt(0).toUpperCase() + '</div><div><p class="text-sm font-medium text-slate-950 dark:text-white">' + p.nombre + '</p><p class="text-xs text-slate-400 sm:hidden">' + p.categoriaNombre + '</p></div></div></td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">' + p.categoriaNombre + '</td>' +
        '<td class="py-3 px-2 text-center text-xs text-slate-400 hidden md:table-cell">' + (p.codigoInterno || p.codigoBarras || '—') + '</td>' +
        '<td class="py-3 px-2 text-center"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + badge + '">' + badgeTxt + '</span></td>' +
        '<td class="py-3 px-2 text-right text-sm font-medium text-slate-950 dark:text-white">' + formatearMoneda(p.precio) + '</td>' +
        '<td class="py-3 px-2 text-right hidden sm:table-cell"><div class="flex gap-1 justify-end">' +
        '<button class="btn-editar text-xs text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors px-2 py-1" data-id="' + p.detalleId + '">Editar</button>' +
        '<button class="btn-eliminar text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1" data-id="' + p.detalleId + '">Eliminar</button>' +
        '</div></td></tr>';
    }).join('');
    renderizarPaginacion();
  }

  function productosFiltrarYRender() {
    var q = ($('buscador-productos').value || '').toLowerCase().trim();
    var catId = $('filtro-categoria').value;
    PRODUCTOS_FILTRADOS = PRODUCTOS.filter(function (p) {
      var matchCat = !catId || p.categoriaId === catId;
      var matchQ = !q || p.nombre.toLowerCase().includes(q) || (p.codigoInterno || '').toLowerCase().includes(q) || (p.codigoBarras || '').toLowerCase().includes(q) || (p.marca || '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });
    PAGINA = 1;
    renderizarTabla();
  }

  /* ───────────────────────────────────────────────
     MULTIMEDIA
     ─────────────────────────────────────────────── */
  function agregarFilaMultimedia(data) {
    var container = $('multimedia-container');
    var idx = container.children.length;
    var row = document.createElement('div');
    row.className = 'multimedia-row grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-3 p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-800/20';

    var urlVal = (data && data.url) || '';
    var tipoVal = (data && data.tipo) || 'imagen';
    var ordenVal = (data && data.orden) || (idx + 1);
    var altVal = (data && data.alt_text) || '';
    var mmId = (data && data.id) || '';

    var btnEliminar = '<button type="button" class="btn-eliminar-mm w-full sm:w-auto px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>Eliminar</button>';

    row.innerHTML =
      '<div class="sm:col-span-2">' +
        '<label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">URL del archivo</label>' +
        '<input type="url" class="mm-url w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/20 transition-all placeholder:text-slate-400" placeholder="https://..." value="' + urlVal + '">' +
      '</div>' +
      '<div>' +
        '<label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Tipo</label>' +
        '<select class="mm-tipo w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/20 transition-all">' +
          '<option value="imagen"' + (tipoVal === 'imagen' ? ' selected' : '') + '>Imagen</option>' +
          '<option value="video"' + (tipoVal === 'video' ? ' selected' : '') + '>Video</option>' +
          '<option value="documento"' + (tipoVal === 'documento' ? ' selected' : '') + '>Documento</option>' +
        '</select>' +
      '</div>' +
      '<div>' +
        '<label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Orden</label>' +
        '<input type="number" class="mm-orden w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/20 transition-all" value="' + ordenVal + '" min="0">' +
      '</div>' +
      '<div class="sm:col-span-3">' +
        '<label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Texto Alternativo</label>' +
        '<input type="text" class="mm-alt w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white/20 transition-all placeholder:text-slate-400" placeholder="Breve descripcion de la imagen" value="' + altVal + '">' +
      '</div>' +
      '<div class="flex items-end">' +
        btnEliminar +
      '</div>' +
      '<input type="hidden" class="mm-id" value="' + mmId + '">';

    container.appendChild(row);
    reordenarMM();
  }

  function eliminarFilaMultimedia(row) {
    var mmId = row.querySelector('.mm-id').value;
    if (mmId) MULTIMEDIA_ELIMINADOS.push(mmId);
    row.remove();
    reordenarMM();
  }

  function reordenarMM() {
    var rows = $('multimedia-container').querySelectorAll('.multimedia-row');
    rows.forEach(function (r, i) {
      r.querySelector('.mm-orden').value = i + 1;
    });
  }

  function obtenerMultimediaRows() {
    var rows = $('multimedia-container').querySelectorAll('.multimedia-row');
    var result = [];
    rows.forEach(function (r) {
      var url = r.querySelector('.mm-url').value.trim();
      if (!url) return;
      result.push({
        id: r.querySelector('.mm-id').value || null,
        url: url,
        tipo: r.querySelector('.mm-tipo').value,
        orden: parseInt(r.querySelector('.mm-orden').value) || 0,
        alt_text: r.querySelector('.mm-alt').value.trim() || null
      });
    });
    return result;
  }

  async function cargarMultimedia(productoId) {
    MULTIMEDIA = [];
    MULTIMEDIA_ELIMINADOS = [];
    $('multimedia-container').innerHTML = '';
    if (!productoId) { agregarFilaMultimedia(); return; }
    var res = await DB.productosMultimedia.listar(productoId);
    if (res.error) { console.error('[Productos] Error multimedia:', res.error); agregarFilaMultimedia(); return; }
    var lista = res.data || [];
    if (!lista.length) { agregarFilaMultimedia(); return; }
    lista.forEach(function (m) { agregarFilaMultimedia(m); });
  }

  /* ───────────────────────────────────────────────
     FORMULARIO
     ─────────────────────────────────────────────── */
  function limpiarFormulario() {
    EDITANDO_ID = null;
    EDITANDO_PRODUCTO_ID = null;
    $('form-titulo').textContent = 'Nuevo Producto';
    $('form-producto-id').textContent = '';
    ['campo-nombre', 'campo-codigo-interno', 'campo-codigo-barras', 'campo-marca', 'campo-modelo', 'campo-tipo-producto',
      'campo-descripcion', 'campo-precio-venta', 'campo-precio-compra', 'campo-precio-mayorista', 'campo-precio-original',
      'campo-tags', 'campo-stock-min', 'campo-stock-max', 'campo-peso', 'campo-dimensiones'
    ].forEach(function (id) { var el = $(id); if (el) el.value = ''; });
    $('campo-stock').value = '0';
    $('campo-descuento-max').value = '0';
    $('campo-margen').value = '';
    $('campo-categoria').value = '';
    $('campo-impuesto').value = '19';
    $('campo-activo').checked = true;
    MULTIMEDIA_ELIMINADOS = [];
    $('multimedia-container').innerHTML = '';
    agregarFilaMultimedia();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cargarEnForm(detalleId) {
    var p = PRODUCTOS.find(function (x) { return x.detalleId === detalleId; });
    if (!p) return;
    EDITANDO_ID = detalleId;
    EDITANDO_PRODUCTO_ID = p.productoId;
    $('form-titulo').textContent = 'Editar Producto';
    $('form-producto-id').textContent = p.nombre;
    $('campo-nombre').value = p.nombre;
    $('campo-codigo-interno').value = p.codigoInterno;
    $('campo-codigo-barras').value = p.codigoBarras;
    $('campo-marca').value = p.marca;
    $('campo-modelo').value = p.modelo;
    $('campo-tipo-producto').value = p.tipoProducto;
    $('campo-descripcion').value = p.descripcion;
    $('campo-precio-venta').value = p.precio;
    $('campo-precio-compra').value = p.precioCompra;
    $('campo-precio-original').value = p.precioOriginal;
    $('campo-precio-mayorista').value = p.precioMayorista;
    $('campo-margen').value = p.margen > 0 ? p.margen + '%' : '';
    $('campo-descuento-max').value = p.descuentoMax;
    $('campo-stock').value = p.stock;
    $('campo-stock-min').value = p.stockMin;
    $('campo-stock-max').value = p.stockMax;
    $('campo-peso').value = p.peso || '';
    $('campo-dimensiones').value = p.dimensiones || '';
    $('campo-categoria').value = p.categoriaId;
    $('campo-tags').value = (p.tags || []).join(', ');
    $('campo-activo').checked = p.activo;
    var tasa = Math.round((p.tasaImpuesto || 0) * 100);
    $('campo-impuesto').value = tasa;
    cargarMultimedia(p.productoId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ───────────────────────────────────────────────
     GUARDAR
     ─────────────────────────────────────────────── */
  async function guardarProducto() {
    if (_guardando) return;
    var nombre = $('campo-nombre').value.trim();
    if (!nombre) { mostrarToast('El nombre del producto es obligatorio'); return; }
    var categoriaId = $('campo-categoria').value;
    if (!categoriaId) { mostrarToast('Selecciona una categoria'); return; }
    var precioVenta = parseFloat($('campo-precio-venta').value) || 0;
    if (precioVenta <= 0) { mostrarToast('El precio de venta debe ser mayor a 0'); return; }

    _guardando = true;
    $('btn-guardar').disabled = true;
    $('btn-guardar').textContent = 'Guardando...';

    try {
      var usuario = window.KubitAuth.obtenerUsuario();
      var userId = usuario ? usuario.id : null;

      var productoData = {
        nombre: nombre,
        categoria_id: categoriaId,
        tipo_producto: $('campo-tipo-producto').value.trim() || null,
        marca: $('campo-marca').value.trim() || null,
        modelo: $('campo-modelo').value.trim() || null,
        descripcion: $('campo-descripcion').value.trim() || null,
        tasa_impuesto: parseFloat($('campo-impuesto').value) / 100 || 0.19,
        activo: $('campo-activo').checked,
        tags: $('campo-tags').value.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
        updated_by: userId
      };

      var detalleData = {
        codigo_interno: $('campo-codigo-interno').value.trim() || null,
        codigo_barras: $('campo-codigo-barras').value.trim() || null,
        precio_compra: parseFloat($('campo-precio-compra').value) || 0,
        precio_venta: precioVenta,
        precio_original: parseFloat($('campo-precio-original').value) || null,
        precio_mayorista: parseFloat($('campo-precio-mayorista').value) || null,
        descuento_max: parseInt($('campo-descuento-max').value) || 0,
        stock_actual: parseInt($('campo-stock').value) || 0,
        stock_min: parseInt($('campo-stock-min').value) || 0,
        stock_max: parseInt($('campo-stock-max').value) || 0,
        peso: parseFloat($('campo-peso').value) || null,
        dimensiones: $('campo-dimensiones').value.trim() || null,
        updated_by: userId
      };

      var precioCompra = parseFloat($('campo-precio-compra').value) || 0;
      if (precioVenta > 0 && precioCompra > 0) {
        detalleData.margen_ganancia = Math.round((precioVenta - precioCompra) / precioCompra * 100);
      }

      var productoId;

      if (EDITANDO_ID) {
        // Actualizar producto
        productoData.id = EDITANDO_PRODUCTO_ID;
        var r1 = await DB.productos.actualizar(EDITANDO_PRODUCTO_ID, productoData);
        if (r1.error) { mostrarToast('Error: ' + r1.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar Producto'; return; }
        var r2 = await DB.productos.detalleActualizar(EDITANDO_ID, detalleData);
        if (r2.error) { mostrarToast('Error: ' + r2.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar Producto'; return; }
        productoId = EDITANDO_PRODUCTO_ID;
        mostrarToast('Producto actualizado');
      } else {
        // Crear producto
        productoData.created_by = userId;
        var r1 = await DB.productos.crear(productoData);
        if (r1.error) { mostrarToast('Error: ' + r1.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar Producto'; return; }
        productoId = r1.data[0].id;
        detalleData.producto_id = productoId;
        detalleData.created_by = userId;
        var r2 = await DB.productos.detalleCrear(detalleData);
        if (r2.error) { mostrarToast('Error al crear detalle: ' + r2.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar Producto'; return; }
        EDITANDO_ID = r2.data[0].id;
        EDITANDO_PRODUCTO_ID = productoId;
        mostrarToast('Producto creado');
      }

      // Guardar multimedia
      var mmRows = obtenerMultimediaRows();
      var mmPromises = mmRows.map(function (mm) {
        if (mm.id) {
          return DB.productosMultimedia.actualizar(mm.id, {
            url: mm.url,
            tipo: mm.tipo,
            orden: mm.orden,
            alt_text: mm.alt_text
          });
        } else {
          return DB.productosMultimedia.crear({
            producto_id: productoId,
            url: mm.url,
            tipo: mm.tipo,
            orden: mm.orden,
            alt_text: mm.alt_text
          });
        }
      });

      // Eliminar multimedia marcados
      MULTIMEDIA_ELIMINADOS.forEach(function (id) {
        mmPromises.push(DB.productosMultimedia.eliminar(id));
      });

      await Promise.all(mmPromises);

      limpiarFormulario();
      await cargarProductos();
    } catch (e) {
      console.error('[Productos] Error guardar:', e);
      mostrarToast('Error inesperado');
    }

    _guardando = false;
    $('btn-guardar').disabled = false;
    $('btn-guardar').textContent = 'Guardar Producto';
  }

  /* ───────────────────────────────────────────────
     ELIMINAR
     ─────────────────────────────────────────────── */
  async function eliminarProducto(detalleId) {
    if (!confirm('¿Eliminar este producto?')) return;
    var p = PRODUCTOS.find(function (x) { return x.detalleId === detalleId; });
    if (!p) return;
    var r = await DB.productos.eliminar(p.productoId);
    if (r.error) { mostrarToast('Error: ' + r.error); return; }
    mostrarToast('Producto eliminado');
    if (EDITANDO_ID === detalleId) limpiarFormulario();
    await cargarProductos();
  }

  /* ───────────────────────────────────────────────
     PAGINACION
     ─────────────────────────────────────────────── */
  function irPagina(n) {
    var total = PRODUCTOS_FILTRADOS.length;
    var paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (n < 1 || n > paginas) return;
    PAGINA = n;
    renderizarTabla();
    $('productos-tbody').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ───────────────────────────────────────────────
     SIDEBAR
     ─────────────────────────────────────────────── */
  function toggleSidebar() {
    var sidebar = $('sidebar');
    var overlay = $('sidebar-overlay');
    var abierto = sidebar.classList.contains('translate-x-0');
    if (abierto) {
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    } else {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
      overlay.classList.remove('hidden');
    }
  }

  /* ───────────────────────────────────────────────
     UTILITY
     ─────────────────────────────────────────────── */
  function formatearMoneda(valor) {
    return '$' + valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function mostrarToast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

  function calcularMargen() {
    var venta = parseFloat($('campo-precio-venta').value) || 0;
    var compra = parseFloat($('campo-precio-compra').value) || 0;
    if (venta > 0 && compra > 0) {
      $('campo-margen').value = Math.round((venta - compra) / compra * 100) + '%';
    } else {
      $('campo-margen').value = '';
    }
  }

  /* ───────────────────────────────────────────────
     EVENTOS
     ─────────────────────────────────────────────── */
  function bindearEventos() {
    // Dark mode
    $('btn-dark').addEventListener('click', function () {
      html.classList.toggle('dark');
      localStorage.setItem('darkMode', html.classList.contains('dark'));
    });

    // Sidebar
    $('btn-menu').addEventListener('click', toggleSidebar);
    $('btn-cerrar-menu').addEventListener('click', toggleSidebar);
    $('sidebar-overlay').addEventListener('click', toggleSidebar);

    // Formulario
    $('btn-limpiar-form').addEventListener('click', limpiarFormulario);
    $('btn-guardar').addEventListener('click', guardarProducto);

    // Margen auto
    $('campo-precio-venta').addEventListener('input', calcularMargen);
    $('campo-precio-compra').addEventListener('input', calcularMargen);

    // Multimedia
    $('btn-agregar-mm').addEventListener('click', function () { agregarFilaMultimedia(); });
    $('multimedia-container').addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-eliminar-mm');
      if (btn) eliminarFilaMultimedia(btn.closest('.multimedia-row'));
    });

    // Filtros
    $('buscador-productos').addEventListener('input', productosFiltrarYRender);
    $('filtro-categoria').addEventListener('change', productosFiltrarYRender);

    // Paginacion
    $('pag-controles').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'pag-prev') irPagina(PAGINA - 1);
      if (btn.id === 'pag-next') irPagina(PAGINA + 1);
    });

    // Tabla (delegacion)
    $('productos-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-editar')) cargarEnForm(btn.dataset.id);
      if (btn.classList.contains('btn-eliminar')) eliminarProducto(btn.dataset.id);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
