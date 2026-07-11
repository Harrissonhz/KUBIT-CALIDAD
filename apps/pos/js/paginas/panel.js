(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;
  var chartVentas = null;
  var chartComparativa = null;

  function formatCOP(val) {
    if (val == null || isNaN(val)) return '$0';
    return '$' + Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function getFiltros() {
    return {
      canalId: $('filtro-canal') ? $('filtro-canal').value : '',
      mes: parseInt($('filtro-mes') ? $('filtro-mes').value : (new Date().getMonth() + 1)),
      anio: parseInt($('filtro-anio') ? $('filtro-anio').value : new Date().getFullYear())
    };
  }

  async function init() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');
    window.KubitAuth.cargarSesion();
    if (!window.KubitAuth.obtenerUsuario()) { window.location.href = 'login.html'; return; }
    window.KubitAuth.aplicarRestriccionesUI();

    $('panel-subtitulo').textContent = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    await cargarCanales();
    poblarSelectores();
    bindearFiltros();
    await cargarTodo();
  }

  async function cargarCanales() {
    var res = await DB.select('pos_canales_venta', {
      select: 'id,nombre',
      filters: [{ col: 'activo', val: true }],
      orderBy: 'nombre'
    });
    var select = $('filtro-canal');
    if (!select) return;
    select.innerHTML = '<option value="">Todos los canales</option>';
    (res.data || []).forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      select.appendChild(opt);
    });
  }

  function poblarSelectores() {
    var anioAct = new Date().getFullYear();
    var mesAct = new Date().getMonth() + 1;
    var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    var selMes = $('filtro-mes');
    if (selMes) {
      selMes.innerHTML = '';
      meses.forEach(function (n, i) {
        var opt = document.createElement('option');
        opt.value = i + 1;
        opt.textContent = n;
        if (i + 1 === mesAct) opt.selected = true;
        selMes.appendChild(opt);
      });
    }

    [['filtro-anio', anioAct], ['chart-anio', anioAct], ['comp-anio1', anioAct - 1], ['comp-anio2', anioAct]].forEach(function (pair) {
      var sel = $(pair[0]);
      if (!sel) return;
      sel.innerHTML = '';
      for (var a = anioAct + 1; a >= 2024; a--) {
        var opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        if (a === pair[1]) opt.selected = true;
        sel.appendChild(opt);
      }
    });
  }

  function bindearFiltros() {
    ['filtro-canal', 'filtro-mes', 'filtro-anio'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener('change', cargarTodo);
    });
    var btn = $('btn-actualizar');
    if (btn) btn.addEventListener('click', cargarTodo);

    var chartAnio = $('chart-anio');
    if (chartAnio) chartAnio.addEventListener('change', function () {
      if (chartVentas) { chartVentas.destroy(); chartVentas = null; }
      cargarVentasMensuales();
    });

    ['comp-anio1', 'comp-anio2'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener('change', function () {
        if (chartComparativa) { chartComparativa.destroy(); chartComparativa = null; }
        cargarComparativaAnual();
      });
    });
  }

  async function cargarTodo() {
    await Promise.all([
      cargarKpisMes(),
      cargarKpisOperativos(),
      cargarTopProductos(),
      cargarVentasMensuales(),
      cargarComparativaAnual()
    ]);
  }

  async function cargarKpisMes() {
    var f = getFiltros();
    var ventasBrutas = 0, comisiones = 0, gastos = 0, utilidadNeta = 0, compras = 0;
    var devoluciones = 0, descuentos = 0, ticketProm = 0, countVentas = 0;

    if (!f.canalId) {
      var res = await DB.finanzasMensuales.obtenerPorPeriodo(f.anio, f.mes);
      if (!res.error && res.data) {
        var d = res.data;
        ventasBrutas = d.ventas_brutas || 0;
        devoluciones = d.devoluciones || 0;
        descuentos = d.descuentos || 0;
        comisiones = d.costos_comision_total || 0;
        gastos = await DB.gastos.totalDelMes(f.anio, f.mes);
        compras = await DB.compras.totalDelMes(f.anio, f.mes);
      }
      var estGlobal = await DB.ventas.estadisticasDelPeriodo(f.anio, f.mes);
      countVentas = estGlobal.count || 0;
    } else {
      var est = await DB.ventas.estadisticasDelPeriodo(f.anio, f.mes, f.canalId);
      ventasBrutas = est.total || 0;
      comisiones = est.costos || 0;
      countVentas = est.count || 0;
      gastos = await DB.gastos.totalDelMes(f.anio, f.mes);
      compras = await DB.compras.totalDelMes(f.anio, f.mes);
    }

    var ventasNetas = ventasBrutas - comisiones - devoluciones - descuentos;
    utilidadNeta = ventasBrutas - comisiones - devoluciones - descuentos - gastos - compras;
    var margen = ventasBrutas > 0 ? Math.round((utilidadNeta / ventasBrutas) * 100) : 0;
    ticketProm = countVentas > 0 ? ventasBrutas / countVentas : 0;

    $('kpi-mes-ventas').textContent = formatCOP(ventasBrutas);
    $('kpi-mes-ventas-netas').textContent = formatCOP(ventasNetas);
    $('kpi-mes-compras').textContent = formatCOP(compras);
    $('kpi-mes-comisiones').textContent = formatCOP(comisiones);
    $('kpi-mes-gastos').textContent = formatCOP(gastos);
    $('kpi-mes-utilidad').textContent = formatCOP(utilidadNeta);
    $('kpi-mes-margen').textContent = margen + '%';
    $('kpi-mes-ticket').textContent = formatCOP(ticketProm);
  }

  async function cargarKpisOperativos() {
    var [estHoy, resProductos, prodHoy] = await Promise.all([
      DB.ventas.estadisticasHoy(),
      DB.productos.listarConDetalle({ skipCache: true }),
      DB.ventas.productosVendidosHoy()
    ]);

    $('kpi-op-ventas-hoy').textContent = estHoy.count || 0;
    $('kpi-op-total-hoy').textContent = formatCOP(estHoy.total || 0);
    $('kpi-op-ticket-prom').textContent = formatCOP(estHoy.promedio || 0);

    var totalProductos = 0, stockBajo = 0, agotados = 0, valorInventario = 0;
    var vistos = {};
    if (resProductos.data) {
      resProductos.data.forEach(function (d) {
        if (!vistos[d.producto_id]) {
          vistos[d.producto_id] = true;
          totalProductos++;
        }
        var stock = d.stock_actual != null ? d.stock_actual : 0;
        var costo = (d.precio_compra > 0) ? d.precio_compra : ((d.precio_venta || 0) / 1.30);
        if (stock <= 0) {
          agotados++;
        } else if (stock <= (d.stock_min || 2)) {
          stockBajo++;
        }
        valorInventario += stock * costo;
      });
    }

    $('kpi-inv-total').textContent = totalProductos;
    $('kpi-inv-stock-bajo').textContent = stockBajo;
    $('kpi-inv-agotados').textContent = agotados;
    $('kpi-inv-valor').textContent = formatCOP(valorInventario);

    $('kpi-op-prod-hoy').textContent = prodHoy;
  }

  async function cargarTopProductos() {
    var container = $('top-productos');
    if (!container) return;
    var f = getFiltros();
    var m = String(f.mes).padStart(2, '0');
    var sigMes = f.mes === 12 ? 1 : f.mes + 1;
    var sigAnio = f.mes === 12 ? f.anio + 1 : f.anio;
    var desde = f.anio + '-' + m + '-01T00:00:00';
    var hasta = sigAnio + '-' + String(sigMes).padStart(2, '0') + '-01T00:00:00';

    var qs = 'select=producto_detalle_id,cantidad,precio_unitario,detalle:producto_detalle_id(*,producto:producto_id(nombre,slug))&created_at=gte.' + desde + '&created_at=lte.' + hasta;
    if (f.canalId) {
      qs += '&venta_id.canales=canal_id.eq.' + encodeURIComponent(f.canalId);
    }

    var res = await DB.select('pos_ventas_detalle', {
      select: 'producto_detalle_id,cantidad,precio_unitario,detalle:producto_detalle_id(*,producto:producto_id(nombre,slug))',
      filters: [
        { col: 'created_at', op: 'gte', val: desde },
        { col: 'created_at', op: 'lte', val: hasta }
      ]
    });

    if (res.error || !res.data || !res.data.length) {
      container.innerHTML = '<p class="text-xs text-slate-400">Sin ventas este periodo</p>';
      return;
    }

    var agrupado = {};
    (res.data || []).forEach(function (d) {
      var id = d.producto_detalle_id;
      if (!agrupado[id]) {
        agrupado[id] = { id: id, cantidad: 0, total: 0, nombre: (d.detalle && d.detalle.producto && d.detalle.producto.nombre) || '---' };
      }
      agrupado[id].cantidad += d.cantidad || 0;
      agrupado[id].total += (d.cantidad || 0) * (d.precio_unitario || 0);
    });

    var totalGlobal = 0;
    var ordenado = Object.keys(agrupado).map(function (k) { return agrupado[k]; })
      .sort(function (a, b) { return b.cantidad - a.cantidad; })
      .slice(0, 5);
    ordenado.forEach(function (p) { totalGlobal += p.total; });

    var html = '';
    ordenado.forEach(function (p, i) {
      var pos = i + 1;
      var bg = pos === 1 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
               pos === 2 ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
               pos === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                           'bg-slate-50 dark:bg-slate-800/50 text-slate-400';
      var pct = totalGlobal > 0 ? Math.round((p.total / totalGlobal) * 100) : 0;
      html += '<div class="flex items-center gap-3 py-1.5">' +
        '<span class="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ' + bg + ' shrink-0">' + pos + '</span>' +
        '<div class="flex-1 min-w-0">' +
          '<span class="text-sm text-slate-700 dark:text-slate-300 truncate block">' + p.nombre + '</span>' +
          '<span class="text-xs text-slate-400">' + p.cantidad + ' u. &middot; ' + formatCOP(p.total) + ' <span class="text-slate-500">(' + pct + '%)</span></span>' +
        '</div>' +
      '</div>';
    });
    container.innerHTML = html;
  }

  async function cargarVentasMensuales() {
    var canvas = $('ventasMensualesChart');
    if (!canvas) return;
    var anio = parseInt($('chart-anio') ? $('chart-anio').value : new Date().getFullYear());
    var f = getFiltros();
    var canalId = f.canalId || null;

    var res = await DB.ventas.porMes(anio, canalId);
    var datos = res.data || [0,0,0,0,0,0,0,0,0,0,0,0];
    var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    if (chartVentas) { chartVentas.destroy(); chartVentas = null; }

    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    chartVentas = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [{
          label: 'Ventas ' + anio,
          data: datos,
          backgroundColor: 'rgba(14, 165, 233, 0.6)',
          borderColor: 'rgba(14, 165, 233, 1)',
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) { return formatCOP(ctx.parsed.y); }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (v) { return v >= 1000000 ? '$' + (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? '$' + (v / 1000).toFixed(0) + 'K' : '$' + v; },
              color: '#94a3b8',
              font: { size: 10 }
            },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          x: {
            ticks: { color: '#94a3b8', font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  async function cargarComparativaAnual() {
    var canvas = $('comparativaChart');
    if (!canvas) return;
    var anio1 = parseInt($('comp-anio1') ? $('comp-anio1').value : new Date().getFullYear() - 1);
    var anio2 = parseInt($('comp-anio2') ? $('comp-anio2').value : new Date().getFullYear());

    if (anio1 === anio2) {
      anio2 = anio1 + 1;
      var sel2 = $('comp-anio2');
      if (sel2) sel2.value = anio2;
    }

    var meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    var f = getFiltros();
    var canalId = f.canalId || null;

    var [r1, r2] = await Promise.all([
      DB.ventas.porMes(anio1, canalId),
      DB.ventas.porMes(anio2, canalId)
    ]);
    var d1 = r1.data || [0,0,0,0,0,0,0,0,0,0,0,0];
    var d2 = r2.data || [0,0,0,0,0,0,0,0,0,0,0,0];

    if (chartComparativa) { chartComparativa.destroy(); chartComparativa = null; }

    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    chartComparativa = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          {
            label: String(anio1),
            data: d1,
            backgroundColor: 'rgba(100, 116, 139, 0.6)',
            borderColor: 'rgba(100, 116, 139, 1)',
            borderWidth: 2,
            borderRadius: 4
          },
          {
            label: String(anio2),
            data: d2,
            backgroundColor: 'rgba(14, 165, 233, 0.6)',
            borderColor: 'rgba(14, 165, 233, 1)',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, padding: 12 }
          },
          tooltip: {
            callbacks: {
              label: function (ctx) { return ctx.dataset.label + ': ' + formatCOP(ctx.parsed.y); }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (v) { return v >= 1000000 ? '$' + (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? '$' + (v / 1000).toFixed(0) + 'K' : '$' + v; },
              color: '#94a3b8',
              font: { size: 10 }
            },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          x: {
            ticks: { color: '#94a3b8', font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
