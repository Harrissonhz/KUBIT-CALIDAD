(function () {
  'use strict';

  var PRODUCTOS_DETALLE = [];
  var MOVIMIENTOS = [];

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
    renderizarTabla(PRODUCTOS_DETALLE);
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

  function renderizarTabla(lista) {
    var tbody = $('inventario-tbody');
    if (!lista.length) {
      tbody.innerHTML = '';
      $('inventario-empty').classList.remove('hidden');
      return;
    }
    $('inventario-empty').classList.add('hidden');
    tbody.innerHTML = lista.map(function (d) {
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
  }

  function renderizarMovimientos() {
    var tbody = $('movimientos-tbody');
    if (!MOVIMIENTOS.length) {
      tbody.innerHTML = '';
      $('movimientos-empty').classList.remove('hidden');
      return;
    }
    $('movimientos-empty').classList.add('hidden');
    tbody.innerHTML = MOVIMIENTOS.map(function (m) {
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
  }

  function filtrarTabla() {
    var q = $('buscador').value.toLowerCase().trim();
    var filtrados = PRODUCTOS_DETALLE.filter(function (d) {
      var p = d.producto || {};
      return (p.nombre || '').toLowerCase().includes(q) ||
             (d.codigo_interno || '').toLowerCase().includes(q);
    });
    renderizarTabla(filtrados);
  }

  async function aplicarAjuste() {
    var detalleId = $('select-producto').value;
    if (!detalleId) { mostrarToast('Selecciona un producto'); return; }

    var cantidadRaw = parseInt($('input-cantidad').value, 10);
    if (!cantidadRaw || cantidadRaw < 1) { mostrarToast('Cantidad inválida'); return; }

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

  function bindearEventos() {
    $('btn-dark').addEventListener('click', function () {
      html.classList.toggle('dark');
      localStorage.setItem('darkMode', html.classList.contains('dark'));
    });

    $('buscador').addEventListener('input', filtrarTabla);
    $('btn-aplicar-ajuste').addEventListener('click', aplicarAjuste);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
