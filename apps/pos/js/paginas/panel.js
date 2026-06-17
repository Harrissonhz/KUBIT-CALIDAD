(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  function formatCOP(val) {
    if (val == null || isNaN(val)) return '$0';
    return '$' + Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  async function init() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');
    window.KubitAuth.cargarSesion();
    if (!window.KubitAuth.obtenerUsuario()) { window.location.href = 'login.html'; return; }
    window.KubitAuth.aplicarRestriccionesUI();

    $('panel-subtitulo').textContent = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    await Promise.all([
      cargarKpisMes(),
      cargarKpisOperativos(),
      cargarTopProductos()
    ]);
  }

  async function cargarKpisMes() {
    var hoy = new Date();
    var anio = hoy.getFullYear();
    var mes = hoy.getMonth() + 1;
    var res = await DB.finanzasMensuales.obtenerPorPeriodo(anio, mes);
    if (res.error || !res.data) {
      $('kpi-mes-ventas').textContent = '$0';
      $('kpi-mes-gastos').textContent = '$0';
      $('kpi-mes-compras').textContent = '$0';
      $('kpi-mes-utilidad').textContent = '$0';
      $('kpi-mes-margen').textContent = '0%';
      return;
    }
    var f = res.data;
    $('kpi-mes-ventas').textContent = formatCOP(f.venta_bruta || 0);
    $('kpi-mes-gastos').textContent = formatCOP(f.total_gastos || 0);
    var compras = (f.costo_mercaderia || 0) + (f.costo_comision || 0);
    $('kpi-mes-compras').textContent = formatCOP(compras);
    $('kpi-mes-utilidad').textContent = formatCOP(f.utilidad_neta || 0);
    $('kpi-mes-margen').textContent = (f.margen != null ? Math.round(f.margen * 100) : 0) + '%';
  }

  async function cargarKpisOperativos() {
    var hoy = new Date().toISOString().slice(0, 10);
    var [estHoy, resProductos] = await Promise.all([
      DB.ventas.estadisticasHoy(),
      DB.productos.listarConDetalle({ skipCache: true })
    ]);
    $('kpi-op-ventas-hoy').textContent = estHoy.count || 0;
    $('kpi-op-ticket-prom').textContent = formatCOP(estHoy.promedio || 0);
    var totalProductos = 0;
    var stockBajo = 0;
    if (resProductos.data) {
      var vistos = {};
      resProductos.data.forEach(function (d) {
        if (!vistos[d.producto_id]) {
          vistos[d.producto_id] = true;
          totalProductos++;
        }
        if (d.stock_actual != null && d.stock_actual <= (d.stock_min || 2)) {
          stockBajo++;
        }
      });
    }
    $('kpi-op-total-productos').textContent = totalProductos;
    $('kpi-op-stock-bajo').textContent = stockBajo;
  }

  async function cargarTopProductos() {
    var container = $('top-productos');
    var res = await DB.ventas.topProductos(5);
    if (res.error || !res.data || !res.data.length) {
      container.innerHTML = '<p class="text-xs text-slate-400">Sin ventas este mes</p>';
      return;
    }
    var html = '';
    res.data.forEach(function (p, i) {
      var pos = i + 1;
      var bg = pos === 1 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
               pos === 2 ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
               pos === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                           'bg-slate-50 dark:bg-slate-800/50 text-slate-400';
      html += '<div class="flex items-center gap-3 py-1.5">' +
        '<span class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ' + bg + '">' + pos + '</span>' +
        '<span class="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">' + p.nombre + '</span>' +
        '<span class="text-sm font-medium text-slate-950 dark:text-white">' + p.cantidad + '</span>' +
      '</div>';
    });
    container.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
