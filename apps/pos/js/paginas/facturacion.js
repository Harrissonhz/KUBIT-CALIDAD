(function () {
  'use strict';

  var FACTURAS = [];
  var FACTURAS_FILTRADAS = [];
  var EDITANDO_ID = null;
  var _guardando = false;
  var PAGE_SIZE = 10;
  var PAGINA = 1;

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  async function init() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');
    window.KubitAuth.cargarSesion();
    if (!window.KubitAuth.obtenerUsuario()) { window.location.href = 'login.html'; return; }
    window.KubitAuth.aplicarRestriccionesUI();

    await cargarFacturas();
    bindearEventos();
  }

  async function cargarFacturas() {
    $('facturas-tbody').innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Cargando...</td></tr>';
    PAGINA = 1;
    var res = await DB.facturacion.listar();
    if (res.error) {
      console.error('[Facturacion] Error:', res.error);
      $('facturas-tbody').innerHTML = '<tr><td colspan="6" class="text-center py-10 text-slate-400">Error al cargar facturas</td></tr>';
      return;
    }
    FACTURAS = res.data || [];
    filtrarYRender();
  }

  function renderizarPaginacion() {
    var total = FACTURAS_FILTRADAS.length;
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
    info.textContent = desde + '\u2013' + hasta + ' de ' + total;

    var disabledPrev = PAGINA <= 1 ? ' opacity-30 pointer-events-none' : '';
    var disabledNext = PAGINA >= paginas ? ' opacity-30 pointer-events-none' : '';
    ctrl.innerHTML =
      '<button id="pag-prev" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' + disabledPrev + '">Anterior</button>' +
      '<span class="text-xs text-slate-400">' + PAGINA + ' / ' + paginas + '</span>' +
      '<button id="pag-next" class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' + disabledNext + '">Siguiente</button>';
  }

  function irPagina(n) {
    var total = FACTURAS_FILTRADAS.length;
    var paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (n < 1 || n > paginas) return;
    PAGINA = n;
    renderizarTabla();
    $('facturas-tbody').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderizarTabla() {
    var tbody = $('facturas-tbody');
    var total = FACTURAS_FILTRADAS.length;
    if (!total) {
      tbody.innerHTML = '';
      $('facturas-empty').classList.remove('hidden');
      renderizarPaginacion();
      return;
    }
    $('facturas-empty').classList.add('hidden');

    var inicio = (PAGINA - 1) * PAGE_SIZE;
    var pagina = FACTURAS_FILTRADAS.slice(inicio, inicio + PAGE_SIZE);

    tbody.innerHTML = pagina.map(function (f) {
      var formatoCOP = window.formatCOP || function (val) { return '$' + Number(val).toLocaleString('es-CO'); };
      var numero = (f.serie || '') + '-' + (f.numero || '');
      var fecha = f.fecha_emision ? new Date(f.fecha_emision).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '\u2014';
      var totalFormateado = f.total != null ? formatoCOP(f.total) : '\u2014';
      var estado = f.estado || 'BORRADOR';
      var badge = '';
      if (estado === 'BORRADOR') badge = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      else if (estado === 'EMITIDA') badge = 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      else if (estado === 'ACEPTADA') badge = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      else if (estado === 'ANULADA') badge = 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      else if (estado === 'RECHAZADA') badge = 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
      else badge = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

      var acciones = '';
      if (estado === 'BORRADOR') {
        acciones += '<button class="btn-emitir text-xs text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors px-2 py-1" data-id="' + f.id + '">Emitir</button>';
      }
      if (estado === 'EMITIDA' || estado === 'ACEPTADA') {
        acciones += '<button class="btn-anular text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1" data-id="' + f.id + '">Anular</button>';
      }
      acciones += '<button class="btn-ver text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" data-id="' + f.id + '" aria-label="Ver detalle">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' +
      '</button>';

      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-4"><span class="text-sm font-medium text-slate-950 dark:text-white">' + numero + '</span></td>' +
        '<td class="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">' + (f.cliente_nombre || '\u2014') + '</td>' +
        '<td class="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">' + fecha + '</td>' +
        '<td class="py-3 px-4 text-sm text-right font-medium text-slate-950 dark:text-white">' + totalFormateado + '</td>' +
        '<td class="py-3 px-4 text-center"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + badge + '">' + estado.charAt(0) + estado.slice(1).toLowerCase() + '</span></td>' +
        '<td class="py-3 px-4 text-right"><div class="flex gap-1 justify-end">' + acciones + '</div></td></tr>';
    }).join('');
    renderizarPaginacion();
  }

  function filtrarYRender() {
    var q = ($('buscador-facturas').value || '').toLowerCase().trim();
    var filtroEstado = $('filtro-estado').value;
    FACTURAS_FILTRADAS = FACTURAS.filter(function (f) {
      var numero = ((f.serie || '') + '-' + (f.numero || '')).toLowerCase();
      var cliente = (f.cliente_nombre || '').toLowerCase();
      var coincideTexto = !q || numero.includes(q) || cliente.includes(q);
      var coincideEstado = !filtroEstado || (f.estado || 'BORRADOR') === filtroEstado;
      return coincideTexto && coincideEstado;
    });
    PAGINA = 1;
    renderizarTabla();
  }

  function mostrarFormNuevaFactura() {
    window.alert('Funcionalidad: crear factura desde venta');
  }

  async function emitirFactura(id) {
    if (!confirm('\u00bfEmitir esta factura?')) return;
    var r = await DB.facturacion.emitir(id);
    if (r.error) { mostrarToast('Error: ' + r.error); return; }
    mostrarToast('Factura emitida');
    await cargarFacturas();
  }

  async function anularFactura(id) {
    if (!confirm('\u00bfAnular esta factura?')) return;
    var r = await DB.facturacion.anular(id);
    if (r.error) { mostrarToast('Error: ' + r.error); return; }
    mostrarToast('Factura anulada');
    await cargarFacturas();
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

    $('buscador-facturas').addEventListener('input', filtrarYRender);
    $('filtro-estado').addEventListener('change', filtrarYRender);
    $('btn-nueva-factura').addEventListener('click', mostrarFormNuevaFactura);

    $('pag-controles').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'pag-prev') irPagina(PAGINA - 1);
      if (btn.id === 'pag-next') irPagina(PAGINA + 1);
    });

    $('facturas-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-emitir')) emitirFactura(btn.dataset.id);
      if (btn.classList.contains('btn-anular')) anularFactura(btn.dataset.id);
      if (btn.classList.contains('btn-ver')) mostrarToast('Funcionalidad: ver detalle de factura');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();