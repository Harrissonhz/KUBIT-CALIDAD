(function () {
  'use strict';

  var PRODUCTOS_DETALLE = [];
  var MOVIMIENTOS = [];
  var PAGE_SIZE = 10;
  var PAGINA_INV = 1;
  var PAGINA_MOV = 1;

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  async function init() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');
    window.KubitAuth.cargarSesion();
    if (!window.KubitAuth.obtenerUsuario()) { window.location.href = 'login.html'; return; }
    window.KubitAuth.aplicarRestriccionesUI();

    await cargarDatos();
    bindearEventos();
  }

  async function cargarDatos() {
    await Promise.all([
      cargarProductosDetalle(),
      cargarMovimientos()
    ]);
    poblarSelectProducto();
    renderizarResumen();
    PAGINA_INV = 1;
    PAGINA_MOV = 1;
    filtrarYRenderInventario();
    renderizarMovimientos();
  }

  async function cargarProductosDetalle() {
    var res = await DB.productos.listarConDetalle({ skipCache: true });
    if (res.error) { console.error('[Inventario] Error productos:', res.error); return; }
    PRODUCTOS_DETALLE = (res.data || []).filter(function (d) {
      return d.producto && d.producto.activo !== false;
    });
  }

  async function cargarMovimientos() {
    var res = await DB.movimientosInventario.listar();
    if (res.error) { console.error('[Inventario] Error movimientos:', res.error); return; }
    MOVIMIENTOS = res.data || [];
    renderizarMovimientos();
  }

  function poblarSelectProducto() {
    var sel = $('select-producto');
    sel.innerHTML = '<option value="">— Seleccionar —</option>';
    PRODUCTOS_DETALLE.forEach(function (d) {
      var nombre = d.producto ? d.producto.nombre : 'Producto #' + d.id;
      var codigo = d.codigo_interno || '';
      sel.innerHTML += '<option value="' + d.id + '">' + nombre + (codigo ? ' (' + codigo + ')' : '') + ' — Stock: ' + d.stock_actual + '</option>';
    });
  }

  function renderizarResumen() {
    var total = PRODUCTOS_DETALLE.length;
    var conStock = 0, stockBajo = 0, agotados = 0;
    PRODUCTOS_DETALLE.forEach(function (d) {
      if ((d.stock_actual || 0) > 10) conStock++;
      else if ((d.stock_actual || 0) > 0) stockBajo++;
      else agotados++;
    });
    $('stat-total-productos').textContent = total;
    $('stat-con-stock').textContent = conStock;
    $('stat-stock-bajo').textContent = stockBajo;
    $('stat-agotados').textContent = agotados;
  }

  /* ════════════════════════════════════════
     FILTER + PAGINATION: Existencias
     ════════════════════════════════════════ */
  function obtenerListaFiltrada() {
    var q = ($('buscador').value || '').toLowerCase().trim();
    if (!q) return PRODUCTOS_DETALLE;
    return PRODUCTOS_DETALLE.filter(function (d) {
      var p = d.producto || {};
      return (p.nombre || '').toLowerCase().includes(q) ||
             (d.codigo_interno || '').toLowerCase().includes(q);
    });
  }

  function renderizarTablaInventario() {
    var lista = obtenerListaFiltrada();
    var tbody = $('inventario-tbody');
    var total = lista.length;
    if (!total) {
      tbody.innerHTML = '';
      $('inventario-empty').classList.remove('hidden');
      renderizarPaginacionInventario(lista);
      return;
    }
    $('inventario-empty').classList.add('hidden');

    var inicio = (PAGINA_INV - 1) * PAGE_SIZE;
    var pagina = lista.slice(inicio, inicio + PAGE_SIZE);
    if (!pagina.length && PAGINA_INV > 1) { PAGINA_INV--; renderizarTablaInventario(); return; }

    tbody.innerHTML = pagina.map(function (d) {
      var p = d.producto || {};
      var cat = (p.categoria && p.categoria.nombre) || '—';
      var stock = d.stock_actual || 0;
      var badgeCls = stock > 10 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                     stock > 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                     'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      var badgeTxt = stock > 10 ? 'OK' : stock > 0 ? 'Bajo' : 'Agotado';
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-2"><span class="text-sm font-medium text-slate-950 dark:text-white">' + (p.nombre || '—') + '</span></td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">' + (d.codigo_interno || '—') + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">' + cat + '</td>' +
        '<td class="py-3 px-2 text-center"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + badgeCls + '">' + stock + ' (' + badgeTxt + ')</span></td>' +
        '<td class="py-3 px-2 text-right text-sm font-medium text-slate-950 dark:text-white hidden md:table-cell">$' + ((d.precio_venta || 0)).toFixed(2) + '</td></tr>';
    }).join('');
    renderizarPaginacionInventario(lista);
  }

  function renderizarPaginacionInventario(lista) {
    var total = lista.length;
    var paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (PAGINA_INV > paginas) PAGINA_INV = paginas;
    var desde = (PAGINA_INV - 1) * PAGE_SIZE + 1;
    var hasta = Math.min(PAGINA_INV * PAGE_SIZE, total);

    var info = $('pag-info-inventario');
    var ctrl = $('pag-controles-inventario');
    if (total === 0) {
      info.textContent = '0 resultados';
      ctrl.innerHTML = '';
      ctrl.classList.add('hidden');
      return;
    }
    ctrl.classList.remove('hidden');
    info.textContent = desde + '–' + hasta + ' de ' + total;

    var disabledPrev = PAGINA_INV <= 1 ? ' opacity-30 pointer-events-none' : '';
    var disabledNext = PAGINA_INV >= paginas ? ' opacity-30 pointer-events-none' : '';
    ctrl.innerHTML =
      '<button id="pag-inv-prev" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' + disabledPrev + '">Anterior</button>' +
      '<span class="text-xs text-slate-400">' + PAGINA_INV + ' / ' + paginas + '</span>' +
      '<button id="pag-inv-next" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' + disabledNext + '">Siguiente</button>';
  }

  function irPaginaInventario(n) {
    var lista = obtenerListaFiltrada();
    var paginas = Math.max(1, Math.ceil(lista.length / PAGE_SIZE));
    if (n < 1 || n > paginas) return;
    PAGINA_INV = n;
    renderizarTablaInventario();
    $('inventario-tbody').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function filtrarYRenderInventario() {
    PAGINA_INV = 1;
    renderizarTablaInventario();
  }

  /* ════════════════════════════════════════
     PAGINATION: Movimientos
     ════════════════════════════════════════ */
  function renderizarMovimientos() {
    var tbody = $('movimientos-tbody');
    var total = MOVIMIENTOS.length;
    if (!total) {
      tbody.innerHTML = '';
      $('movimientos-empty').classList.remove('hidden');
      renderizarPaginacionMovimientos();
      return;
    }
    $('movimientos-empty').classList.add('hidden');

    var inicio = (PAGINA_MOV - 1) * PAGE_SIZE;
    var pagina = MOVIMIENTOS.slice(inicio, inicio + PAGE_SIZE);
    if (!pagina.length && PAGINA_MOV > 1) { PAGINA_MOV--; renderizarMovimientos(); return; }

    tbody.innerHTML = pagina.map(function (m) {
      var prod = m.producto_detalle ? (m.producto_detalle.producto ? m.producto_detalle.producto.nombre : '—') : '—';
      var fecha = m.fecha ? new Date(m.fecha).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
      var esEntrada = (m.tipo_movimiento || '').startsWith('entrada');
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-2 text-xs text-slate-500 dark:text-slate-400">' + fecha + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-950 dark:text-white hidden sm:table-cell">' + prod + '</td>' +
        '<td class="py-3 px-2 text-xs"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + (esEntrada ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600') + '">' + (m.tipo_movimiento || '—') + '</span></td>' +
        '<td class="py-3 px-2 text-center text-sm font-semibold ' + (esEntrada ? 'text-emerald-600' : 'text-red-600') + '">' + (esEntrada ? '+' : '-') + (m.cantidad || 0) + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">' + (m.motivo || '—') + '</td></tr>';
    }).join('');
    renderizarPaginacionMovimientos();
  }

  function renderizarPaginacionMovimientos() {
    var total = MOVIMIENTOS.length;
    var paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (PAGINA_MOV > paginas) PAGINA_MOV = paginas;
    var desde = (PAGINA_MOV - 1) * PAGE_SIZE + 1;
    var hasta = Math.min(PAGINA_MOV * PAGE_SIZE, total);

    var info = $('pag-info-movimientos');
    var ctrl = $('pag-controles-movimientos');
    if (total === 0) {
      info.textContent = '0 resultados';
      ctrl.innerHTML = '';
      ctrl.classList.add('hidden');
      return;
    }
    ctrl.classList.remove('hidden');
    info.textContent = desde + '–' + hasta + ' de ' + total;

    var disabledPrev = PAGINA_MOV <= 1 ? ' opacity-30 pointer-events-none' : '';
    var disabledNext = PAGINA_MOV >= paginas ? ' opacity-30 pointer-events-none' : '';
    ctrl.innerHTML =
      '<button id="pag-mov-prev" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' + disabledPrev + '">Anterior</button>' +
      '<span class="text-xs text-slate-400">' + PAGINA_MOV + ' / ' + paginas + '</span>' +
      '<button id="pag-mov-next" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' + disabledNext + '">Siguiente</button>';
  }

  function irPaginaMovimientos(n) {
    var paginas = Math.max(1, Math.ceil(MOVIMIENTOS.length / PAGE_SIZE));
    if (n < 1 || n > paginas) return;
    PAGINA_MOV = n;
    renderizarMovimientos();
    $('movimientos-tbody').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function aplicarAjuste() {
    var detalleId = $('select-producto').value;
    if (!detalleId) { mostrarToast('Selecciona un producto'); return; }

    var cantidadRaw = parseInt($('input-cantidad').value, 10);
    if (!cantidadRaw || cantidadRaw < 1) { mostrarToast('Cantidad invalida'); return; }

    var tipo = $('select-tipo').value;
    var esEntrada = tipo.startsWith('entrada');
    var cantidad = esEntrada ? cantidadRaw : -cantidadRaw;
    var motivo = $('input-motivo').value.trim() || 'Ajuste manual';

    var user = window.KubitAuth.obtenerUsuario();
    var usuarioId = user ? user.id : null;

    $('btn-aplicar-ajuste').disabled = true;
    $('btn-aplicar-ajuste').textContent = 'Aplicando...';

    try {
      var res = await DB.productos.ajustarStock(detalleId, cantidad, tipo, motivo, { usuarioId: usuarioId });
      if (res.error) {
        mostrarToast('Error: ' + res.error);
        $('btn-aplicar-ajuste').disabled = false;
        $('btn-aplicar-ajuste').textContent = 'Aplicar Ajuste';
        return;
      }
      mostrarToast('Stock ajustado: ' + res.data.stock_anterior + ' → ' + res.data.stock_nuevo);
      $('input-cantidad').value = '1';
      $('input-motivo').value = '';
      await cargarDatos();
    } catch (e) {
      console.error('[Inventario] Error ajuste:', e);
      mostrarToast('Error inesperado');
    }

    $('btn-aplicar-ajuste').disabled = false;
    $('btn-aplicar-ajuste').textContent = 'Aplicar Ajuste';
  }

  function mostrarToast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

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

  function bindearEventos() {
    $('btn-dark').addEventListener('click', function () {
      html.classList.toggle('dark');
      localStorage.setItem('darkMode', html.classList.contains('dark'));
    });

    $('btn-menu').addEventListener('click', toggleSidebar);
    $('btn-cerrar-menu').addEventListener('click', toggleSidebar);
    $('sidebar-overlay').addEventListener('click', toggleSidebar);

    $('buscador').addEventListener('input', filtrarYRenderInventario);

    $('pag-controles-inventario').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'pag-inv-prev') irPaginaInventario(PAGINA_INV - 1);
      if (btn.id === 'pag-inv-next') irPaginaInventario(PAGINA_INV + 1);
    });

    $('pag-controles-movimientos').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'pag-mov-prev') irPaginaMovimientos(PAGINA_MOV - 1);
      if (btn.id === 'pag-mov-next') irPaginaMovimientos(PAGINA_MOV + 1);
    });

    $('btn-aplicar-ajuste').addEventListener('click', aplicarAjuste);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
