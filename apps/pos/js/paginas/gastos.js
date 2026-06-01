(function () {
  'use strict';

  var GASTOS = [];
  var GASTOS_FILTRADOS = [];
  var EDITANDO_ID = null;
  var _guardando = false;

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  async function init() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');
    window.KubitAuth.cargarSesion();
    if (!window.KubitAuth.obtenerUsuario()) { window.location.href = 'login.html'; return; }
    window.KubitAuth.aplicarRestriccionesUI();

    poblarSelectores();
    await cargarGastos();
    bindearEventos();
  }

  function poblarSelectores() {
    var selMes = $('sel-mes');
    selMes.innerHTML = '';
    var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    for (var i = 0; i < 12; i++) {
      var op = document.createElement('option');
      op.value = i + 1;
      op.textContent = meses[i];
      selMes.appendChild(op);
    }
    selMes.value = new Date().getMonth() + 1;

    var selAnio = $('sel-anio');
    selAnio.innerHTML = '';
    var anioActual = new Date().getFullYear();
    for (var a = anioActual; a >= anioActual - 1; a--) {
      var op2 = document.createElement('option');
      op2.value = a;
      op2.textContent = a;
      selAnio.appendChild(op2);
    }
    selAnio.value = anioActual;
  }

  async function cargarGastos() {
    $('gastos-tbody').innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-400">Cargando...</td></tr>';
    var anio = parseInt($('sel-anio').value);
    var mes = parseInt($('sel-mes').value);
    var res = await DB.gastos.listarPorPeriodo(anio, mes);
    if (res.error) {
      console.error('[Gastos] Error:', res.error);
      $('gastos-tbody').innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400">Error al cargar gastos</td></tr>';
      return;
    }
    GASTOS = res.data || [];
    GASTOS_FILTRADOS = GASTOS;
    renderizarTabla();
  }

  function renderizarTabla() {
    var tbody = $('gastos-tbody');
    if (!GASTOS_FILTRADOS.length) {
      tbody.innerHTML = '';
      $('gastos-empty').classList.remove('hidden');
      calcularTotal();
      return;
    }
    $('gastos-empty').classList.add('hidden');

    tbody.innerHTML = GASTOS_FILTRADOS.map(function (g) {
      var formatoCOP = window.formatCOP || function (val) { return '$' + Number(val).toLocaleString('es-CO'); };
      var catNombre = (g.categoria && g.categoria.nombre) || '\u2014';
      var fecha = g.created_at ? new Date(g.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '\u2014';
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-4"><span class="text-sm font-medium text-slate-950 dark:text-white">' + catNombre + '</span></td>' +
        '<td class="py-3 px-4 text-sm text-right font-medium text-slate-950 dark:text-white">' + formatoCOP(g.monto) + '</td>' +
        '<td class="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">' + (g.notas || '\u2014') + '</td>' +
        '<td class="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">' + fecha + '</td>' +
        '<td class="py-3 px-4 text-right"><div class="flex gap-1 justify-end">' +
        '<button class="btn-editar text-xs text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors px-2 py-1" data-id="' + g.id + '">Editar</button>' +
        '<button class="btn-eliminar text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1" data-id="' + g.id + '">Eliminar</button>' +
        '</div></td></tr>';
    }).join('');
    calcularTotal();
  }

  function calcularTotal() {
    var total = GASTOS_FILTRADOS.reduce(function (sum, g) { return sum + (parseFloat(g.monto) || 0); }, 0);
    var formatoCOP = window.formatCOP || function (val) { return '$' + Number(val).toLocaleString('es-CO'); };
    $('total-gastos').textContent = formatoCOP(total);
  }

  var _categoriasCargadas = false;

  async function cargarCategorias() {
    var sel = $('campo-categoria');
    if (_categoriasCargadas) return;
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    var res = await DB.gastoCategorias.listarActivas();
    if (res.data) {
      res.data.forEach(function (c) {
        var op = document.createElement('option');
        op.value = c.id;
        op.textContent = c.nombre;
        sel.appendChild(op);
      });
    }
    _categoriasCargadas = true;
  }

  function limpiarFormulario() {
    EDITANDO_ID = null;
    $('form-titulo').textContent = 'Nuevo Gasto';
    $('campo-categoria').value = '';
    $('campo-monto').value = '';
    $('campo-notas').value = '';
    $('form-gasto').classList.remove('hidden');
  }

  function cargarEnForm(id) {
    var g = GASTOS.find(function (x) { return x.id === id; });
    if (!g) return;
    EDITANDO_ID = id;
    $('form-titulo').textContent = 'Editar Gasto';
    $('campo-categoria').value = g.categoria_id || '';
    $('campo-monto').value = g.monto || '';
    $('campo-notas').value = g.notas || '';
    $('form-gasto').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function obtenerDatosForm() {
    return {
      anio: parseInt($('sel-anio').value),
      mes: parseInt($('sel-mes').value),
      categoria_id: $('campo-categoria').value,
      monto: parseFloat($('campo-monto').value) || 0,
      notas: $('campo-notas').value.trim() || null
    };
  }

  async function guardarGasto() {
    if (_guardando) return;
    var catId = $('campo-categoria').value;
    var monto = parseFloat($('campo-monto').value);
    if (!catId) { mostrarToast('Selecciona una categor\u00eda'); return; }
    if (!monto || monto <= 0) { mostrarToast('Ingresa un monto v\u00e1lido'); return; }

    _guardando = true;
    $('btn-guardar-gasto').disabled = true;
    $('btn-guardar-gasto').textContent = 'Guardando...';

    try {
      var data = obtenerDatosForm();
      var res;
      if (EDITANDO_ID) {
        res = await DB.gastos.actualizar(EDITANDO_ID, data);
        if (!res.error) mostrarToast('Gasto actualizado');
      } else {
        res = await DB.gastos.crear(data);
        if (!res.error) mostrarToast('Gasto creado');
      }

      if (res.error) { mostrarToast('Error: ' + res.error); _guardando = false; $('btn-guardar-gasto').disabled = false; $('btn-guardar-gasto').textContent = 'Guardar Gasto'; return; }

      limpiarFormulario();
      $('form-gasto').classList.add('hidden');
      await cargarGastos();
    } catch (e) {
      console.error('[Gastos] Error guardar:', e);
      mostrarToast('Error inesperado');
    }

    _guardando = false;
    $('btn-guardar-gasto').disabled = false;
    $('btn-guardar-gasto').textContent = 'Guardar Gasto';
  }

  async function eliminarGasto(id) {
    if (!confirm('\u00bfEliminar este gasto?')) return;
    var r = await DB.gastos.eliminar(id);
    if (r.error) { mostrarToast('Error: ' + r.error); return; }
    mostrarToast('Gasto eliminado');
    if (EDITANDO_ID === id) { limpiarFormulario(); $('form-gasto').classList.add('hidden'); }
    await cargarGastos();
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

    $('sel-mes').addEventListener('change', function () { cargarGastos(); });
    $('sel-anio').addEventListener('change', function () { cargarGastos(); });

    $('btn-nuevo-gasto').addEventListener('click', function () {
      _categoriasCargadas = false;
      limpiarFormulario();
      cargarCategorias();
    });
    $('btn-cancelar-gasto').addEventListener('click', function () {
      $('form-gasto').classList.add('hidden');
    });
    $('btn-guardar-gasto').addEventListener('click', guardarGasto);

    $('gastos-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-editar')) {
        cargarCategorias();
        cargarEnForm(btn.dataset.id);
      }
      if (btn.classList.contains('btn-eliminar')) eliminarGasto(btn.dataset.id);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();