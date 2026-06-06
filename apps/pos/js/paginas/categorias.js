(function () {
  'use strict';

  var CATEGORIAS = [];
  var CATEGORIAS_FILTRADAS = [];
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
    await Promise.all([cargarCategorias()]);
    bindearEventos();
  }

  async function cargarCategorias() {
    $('categorias-tbody').innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-400">Cargando...</td></tr>';
    PAGINA = 1;
    var res = await DB.categorias.listarTodas();
    if (res.error) {
      console.error('[Categorias] Error:', res.error);
      $('categorias-tbody').innerHTML = '<tr><td colspan="5" class="text-center py-10 text-slate-400">Error al cargar categorias</td></tr>';
      return;
    }
    CATEGORIAS = res.data || [];
    poblarSelectPadre();
    filtrarYRender();
  }

  function poblarSelectPadre() {
    var sel = $('campo-padre');
    var actual = sel.value;
    sel.innerHTML = '<option value="">Ninguna (raiz)</option>';
    CATEGORIAS.forEach(function (c) {
      if (c.id === EDITANDO_ID) return;
      sel.innerHTML += '<option value="' + c.id + '">' + c.nombre + '</option>';
    });
    if (actual) sel.value = actual;
  }

  function filtrarYRender() {
    var q = ($('buscador-categorias').value || '').toLowerCase().trim();
    CATEGORIAS_FILTRADAS = CATEGORIAS.filter(function (c) {
      return c.nombre.toLowerCase().includes(q) || (c.codigo || '').toLowerCase().includes(q);
    });
    PAGINA = 1;
    renderizarTabla();
  }

  function renderizarPaginacion() {
    var total = CATEGORIAS_FILTRADAS.length;
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

  function irPagina(n) {
    var total = CATEGORIAS_FILTRADAS.length;
    var paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (n < 1 || n > paginas) return;
    PAGINA = n;
    renderizarTabla();
    $('categorias-tbody').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderizarTabla() {
    var tbody = $('categorias-tbody');
    var total = CATEGORIAS_FILTRADAS.length;
    $('categorias-count').textContent = '(' + total + ')';
    if (!total) {
      tbody.innerHTML = '';
      $('categorias-empty').classList.remove('hidden');
      renderizarPaginacion();
      return;
    }
    $('categorias-empty').classList.add('hidden');

    var inicio = (PAGINA - 1) * PAGE_SIZE;
    var pagina = CATEGORIAS_FILTRADAS.slice(inicio, inicio + PAGE_SIZE);

    tbody.innerHTML = pagina.map(function (c) {
      var padre = c.categoria_padre_id ? (CATEGORIAS.find(function (x) { return x.id === c.categoria_padre_id; }) || {}).nombre || '—' : '—';
      var color = c.color || '#64748b';
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-2"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full shrink-0" style="background:' + color + '"></span><span class="text-sm font-medium text-slate-950 dark:text-white">' + c.nombre + '</span></div></td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">' + (c.codigo || '—') + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">' + padre + '</td>' +
        '<td class="py-3 px-2 text-center"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + (c.activa !== false ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400') + '">' + (c.activa !== false ? 'Activa' : 'Inactiva') + '</span></td>' +
        '<td class="py-3 px-2 text-right"><div class="flex gap-1 justify-end">' +
        '<button class="btn-editar text-slate-400 hover:text-sky-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" data-id="' + c.id + '" aria-label="Editar">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>' +
        '</button>' +
        '<button class="btn-eliminar text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20" data-id="' + c.id + '" aria-label="Eliminar">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>' +
        '</button>' +
        '</div></td></tr>';
    }).join('');
    renderizarPaginacion();
  }

  function limpiarFormulario() {
    EDITANDO_ID = null;
    $('form-titulo').textContent = 'Nueva Categoria';
    $('form-categoria-id').textContent = '';
    $('campo-nombre').value = '';
    $('campo-codigo').value = '';
    $('campo-descripcion').value = '';
    $('campo-padre').value = '';
    $('campo-color').value = '#64748b';
    $('campo-color-texto').value = '#64748b';
    $('campo-activa').checked = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cargarEnForm(id) {
    var c = CATEGORIAS.find(function (x) { return x.id === id; });
    if (!c) return;
    EDITANDO_ID = id;
    $('form-titulo').textContent = 'Editar Categoria';
    $('form-categoria-id').textContent = c.nombre;
    $('campo-nombre').value = c.nombre;
    $('campo-codigo').value = c.codigo || '';
    $('campo-descripcion').value = c.descripcion || '';
    $('campo-padre').value = c.categoria_padre_id || '';
    $('campo-color').value = c.color || '#64748b';
    $('campo-color-texto').value = c.color || '#64748b';
    $('campo-activa').checked = c.activa !== false;
    poblarSelectPadre();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function guardar() {
    if (_guardando) return;
    var nombre = $('campo-nombre').value.trim();
    if (!nombre) { mostrarToast('El nombre es obligatorio'); return; }

    _guardando = true;
    $('btn-guardar').disabled = true;
    $('btn-guardar').textContent = 'Guardando...';

    try {
      var data = {
        nombre: nombre,
        codigo: $('campo-codigo').value.trim() || null,
        descripcion: $('campo-descripcion').value.trim() || null,
        color: $('campo-color').value || null,
        categoria_padre_id: $('campo-padre').value || null,
        activa: $('campo-activa').checked
      };

      var res;
      if (EDITANDO_ID) {
        res = await DB.categorias.actualizar(EDITANDO_ID, data);
        if (!res.error) mostrarToast('Categoria actualizada');
      } else {
        res = await DB.categorias.crear(data);
        if (!res.error) mostrarToast('Categoria creada');
      }

      if (res.error) { mostrarToast('Error: ' + res.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar Categoria'; return; }

      limpiarFormulario();
      await cargarCategorias();
    } catch (e) {
      console.error('[Categorias] Error guardar:', e);
      mostrarToast('Error inesperado');
    }

    _guardando = false;
    $('btn-guardar').disabled = false;
    $('btn-guardar').textContent = 'Guardar Categoria';
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta categoria?')) return;
    var r = await DB.categorias.eliminar(id);
    if (r.error) { mostrarToast('Error: ' + r.error); return; }
    mostrarToast('Categoria eliminada');
    if (EDITANDO_ID === id) limpiarFormulario();
    await cargarCategorias();
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

    // Sidebar
    $('btn-menu').addEventListener('click', toggleSidebar);
    $('btn-cerrar-menu').addEventListener('click', toggleSidebar);
    $('sidebar-overlay').addEventListener('click', toggleSidebar);

    $('btn-guardar').addEventListener('click', guardar);
    $('btn-limpiar-form').addEventListener('click', limpiarFormulario);
    $('buscador-categorias').addEventListener('input', filtrarYRender);

    $('campo-color').addEventListener('input', function () {
      $('campo-color-texto').value = this.value;
    });
    $('campo-color-texto').addEventListener('input', function () {
      if (/^#[0-9a-f]{6}$/i.test(this.value)) $('campo-color').value = this.value;
    });

    // Paginacion
    $('pag-controles').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'pag-prev') irPagina(PAGINA - 1);
      if (btn.id === 'pag-next') irPagina(PAGINA + 1);
    });

    $('categorias-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-editar')) cargarEnForm(btn.dataset.id);
      if (btn.classList.contains('btn-eliminar')) eliminar(btn.dataset.id);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
