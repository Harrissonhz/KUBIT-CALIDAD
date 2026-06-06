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
        '<button class="btn-editar text-slate-400 hover:text-sky-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" data-id="' + g.id + '" aria-label="Editar">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>' +
        '</button>' +
        '<button class="btn-eliminar text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20" data-id="' + g.id + '" aria-label="Eliminar">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>' +
        '</button>' +
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

  /* ═══ CRUD Categorias de Gastos ═══ */
  var CATEGORIAS_GASTO = [];
  var EDITANDO_CAT_ID = null;
  var _guardandoCat = false;

  async function cargarTodasLasCategorias() {
    $('cat-gasto-tbody').innerHTML = '<tr><td colspan="4" class="text-center py-8 text-slate-400 text-sm">Cargando...</td></tr>';
    var res = await DB.gastoCategorias.listar({ orderBy: 'nombre' });
    if (res.error) {
      $('cat-gasto-tbody').innerHTML = '<tr><td colspan="4" class="text-center py-8 text-slate-400">Error al cargar</td></tr>';
      return;
    }
    CATEGORIAS_GASTO = res.data || [];
    renderizarTablaCategorias();
  }

  function renderizarTablaCategorias() {
    var tbody = $('cat-gasto-tbody');
    if (!CATEGORIAS_GASTO.length) {
      tbody.innerHTML = '';
      $('cat-gasto-empty').classList.remove('hidden');
      return;
    }
    $('cat-gasto-empty').classList.add('hidden');
    tbody.innerHTML = CATEGORIAS_GASTO.map(function (c) {
      var badge = c.activa
        ? '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Activa</span>'
        : '<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">Inactiva</span>';
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-2.5 px-3"><span class="text-sm font-medium text-slate-950 dark:text-white">' + escaparHTML(c.nombre) + '</span></td>' +
        '<td class="py-2.5 px-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">' + (c.descripcion ? escaparHTML(c.descripcion) : '<span class="text-slate-300 dark:text-slate-600">—</span>') + '</td>' +
        '<td class="py-2.5 px-3 text-center">' + badge + '</td>' +
        '<td class="py-2.5 px-3 text-right"><div class="flex gap-1 justify-end">' +
        '<button class="btn-editar-cat text-slate-400 hover:text-sky-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" data-id="' + c.id + '" aria-label="Editar">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>' +
        '</button>' +
        '<button class="btn-eliminar-cat text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20" data-id="' + c.id + '" aria-label="Eliminar">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>' +
        '</button>' +
        '</div></td></tr>';
    }).join('');
  }

  function escaparHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function limpiarFormCatGasto() {
    EDITANDO_CAT_ID = null;
    $('form-cat-titulo').textContent = 'Nueva Categoria';
    $('campo-cat-nombre').value = '';
    $('campo-cat-descripcion').value = '';
    $('campo-cat-activa').checked = true;
    $('form-categoria-gasto').classList.remove('hidden');
    $('btn-nueva-cat-gasto').classList.add('hidden');
  }

  function cargarCatEnForm(id) {
    var c = CATEGORIAS_GASTO.find(function (x) { return x.id === id; });
    if (!c) return;
    EDITANDO_CAT_ID = id;
    $('form-cat-titulo').textContent = 'Editar Categoria';
    $('campo-cat-nombre').value = c.nombre || '';
    $('campo-cat-descripcion').value = c.descripcion || '';
    $('campo-cat-activa').checked = c.activa !== false;
    $('form-categoria-gasto').classList.remove('hidden');
    $('btn-nueva-cat-gasto').classList.add('hidden');
  }

  async function guardarCategoriaGasto() {
    if (_guardandoCat) return;
    var nombre = $('campo-cat-nombre').value.trim();
    if (!nombre) { mostrarToast('El nombre es obligatorio'); return; }

    _guardandoCat = true;
    $('btn-guardar-cat-gasto').disabled = true;
    $('btn-guardar-cat-gasto').textContent = 'Guardando...';

    try {
      var data = {
        nombre: nombre,
        descripcion: $('campo-cat-descripcion').value.trim() || null,
        activa: $('campo-cat-activa').checked
      };
      var res;
      if (EDITANDO_CAT_ID) {
        res = await DB.gastoCategorias.actualizar(EDITANDO_CAT_ID, data);
        if (!res.error) mostrarToast('Categoria actualizada');
      } else {
        res = await DB.gastoCategorias.crear(data);
        if (!res.error) mostrarToast('Categoria creada');
      }
      if (res.error) { mostrarToast('Error: ' + res.error); _guardandoCat = false; $('btn-guardar-cat-gasto').disabled = false; $('btn-guardar-cat-gasto').textContent = 'Guardar'; return; }

      cancelarFormCatGasto();
      await cargarTodasLasCategorias();
    } catch (e) {
      console.error('[Gastos] Error guardar categoria:', e);
      mostrarToast('Error inesperado');
    }

    _guardandoCat = false;
    $('btn-guardar-cat-gasto').disabled = false;
    $('btn-guardar-cat-gasto').textContent = 'Guardar';
  }

  function cancelarFormCatGasto() {
    EDITANDO_CAT_ID = null;
    $('form-categoria-gasto').classList.add('hidden');
    $('btn-nueva-cat-gasto').classList.remove('hidden');
  }

  async function eliminarCategoriaGasto(id) {
    if (!confirm('¿Eliminar esta categoria?')) return;
    var r = await DB.gastoCategorias.eliminar(id);
    if (r.error) { mostrarToast('Error: ' + r.error); return; }
    mostrarToast('Categoria eliminada');
    if (EDITANDO_CAT_ID === id) cancelarFormCatGasto();
    await cargarTodasLasCategorias();
  }

  function abrirModalCategorias() {
    $('modal-gasto-categorias').classList.remove('hidden');
    cancelarFormCatGasto();
    cargarTodasLasCategorias();
  }

  function cerrarModalCategorias() {
    $('modal-gasto-categorias').classList.add('hidden');
    cancelarFormCatGasto();
    _categoriasCargadas = false;
    cargarCategorias();
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

    /* ═══ Eventos Categorias de Gastos ═══ */
    $('btn-gestionar-categorias').addEventListener('click', abrirModalCategorias);

    var modalCat = $('modal-gasto-categorias');
    modalCat.querySelectorAll('.modal-close').forEach(function (el) {
      el.addEventListener('click', cerrarModalCategorias);
    });
    $('modal-gasto-categorias-overlay').addEventListener('click', cerrarModalCategorias);

    $('btn-nueva-cat-gasto').addEventListener('click', function () {
      limpiarFormCatGasto();
      $('campo-cat-nombre').focus();
    });
    $('btn-cancelar-cat-gasto').addEventListener('click', cancelarFormCatGasto);
    $('btn-guardar-cat-gasto').addEventListener('click', guardarCategoriaGasto);

    $('cat-gasto-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-editar-cat')) {
        cargarCatEnForm(btn.dataset.id);
      }
      if (btn.classList.contains('btn-eliminar-cat')) {
        eliminarCategoriaGasto(btn.dataset.id);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modalCat.classList.contains('hidden')) {
        cerrarModalCategorias();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();