(function () {
  'use strict';

  var CLIENTES = [];
  var CLIENTES_FILTRADOS = [];
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

    await cargarClientes();
    bindearEventos();
  }

  async function cargarClientes() {
    $('clientes-tbody').innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Cargando...</td></tr>';
    PAGINA = 1;
    var res = await DB.clientes.listar();
    if (res.error) {
      console.error('[Clientes] Error:', res.error);
      $('clientes-tbody').innerHTML = '<tr><td colspan="6" class="text-center py-10 text-slate-400">Error al cargar clientes</td></tr>';
      return;
    }
    CLIENTES = res.data || [];
    filtrarYRender();
  }

  function renderizarPaginacion() {
    var total = CLIENTES_FILTRADOS.length;
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
    var total = CLIENTES_FILTRADOS.length;
    var paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (n < 1 || n > paginas) return;
    PAGINA = n;
    renderizarTabla();
    $('clientes-tbody').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderizarTabla() {
    var tbody = $('clientes-tbody');
    var total = CLIENTES_FILTRADOS.length;
    $('clientes-count').textContent = '(' + total + ')';
    if (!total) {
      tbody.innerHTML = '';
      $('clientes-empty').classList.remove('hidden');
      renderizarPaginacion();
      return;
    }
    $('clientes-empty').classList.add('hidden');

    var inicio = (PAGINA - 1) * PAGE_SIZE;
    var pagina = CLIENTES_FILTRADOS.slice(inicio, inicio + PAGE_SIZE);

    tbody.innerHTML = pagina.map(function (c) {
      var nombre = [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido].filter(Boolean).join(' ');
      var doc = (c.tipo_id || '') + ' ' + (c.numero_id || '');
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-2"><span class="text-sm font-medium text-slate-950 dark:text-white">' + nombre + '</span></td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">' + (doc || '—') + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">' + (c.celular || '—') + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">' + (c.email || '—') + '</td>' +
        '<td class="py-3 px-2 text-center"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + (c.activo !== false ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400') + '">' + (c.activo !== false ? 'Activo' : 'Inactivo') + '</span></td>' +
        '<td class="py-3 px-2 text-right"><div class="flex gap-1 justify-end">' +
        '<button class="btn-editar text-xs text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors px-2 py-1" data-id="' + c.id + '">Editar</button>' +
        '<button class="btn-eliminar text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1" data-id="' + c.id + '">Eliminar</button>' +
        '</div></td></tr>';
    }).join('');
    renderizarPaginacion();
  }

  function filtrarYRender() {
    var q = ($('buscador-clientes').value || '').toLowerCase().trim();
    CLIENTES_FILTRADOS = CLIENTES.filter(function (c) {
      var nombre = [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido].filter(Boolean).join(' ').toLowerCase();
      var doc = ((c.tipo_id || '') + ' ' + (c.numero_id || '')).toLowerCase();
      var email = (c.email || '').toLowerCase();
      return nombre.includes(q) || doc.includes(q) || email.includes(q);
    });
    PAGINA = 1;
    renderizarTabla();
  }

  function limpiarFormulario() {
    EDITANDO_ID = null;
    $('form-titulo').textContent = 'Nuevo Cliente';
    $('form-cliente-id').textContent = '';
    $('campo-tipo-id').value = 'CC';
    $('campo-numero-id').value = '';
    $('campo-primer-nombre').value = '';
    $('campo-segundo-nombre').value = '';
    $('campo-primer-apellido').value = '';
    $('campo-segundo-apellido').value = '';
    $('campo-email').value = '';
    $('campo-celular').value = '';
    $('campo-telefono').value = '';
    $('campo-fecha-nacimiento').value = '';
    $('campo-genero').value = '';
    $('campo-direccion').value = '';
    $('campo-ciudad').value = '';
    $('campo-departamento').value = '';
    $('campo-notas').value = '';
    $('campo-activo').checked = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cargarEnForm(id) {
    var c = CLIENTES.find(function (x) { return x.id === id; });
    if (!c) return;
    EDITANDO_ID = id;
    $('form-titulo').textContent = 'Editar Cliente';
    $('form-cliente-id').textContent = c.primer_nombre + ' ' + c.primer_apellido;
    $('campo-tipo-id').value = c.tipo_id || 'CC';
    $('campo-numero-id').value = c.numero_id || '';
    $('campo-primer-nombre').value = c.primer_nombre || '';
    $('campo-segundo-nombre').value = c.segundo_nombre || '';
    $('campo-primer-apellido').value = c.primer_apellido || '';
    $('campo-segundo-apellido').value = c.segundo_apellido || '';
    $('campo-email').value = c.email || '';
    $('campo-celular').value = c.celular || '';
    $('campo-telefono').value = c.telefono || '';
    $('campo-fecha-nacimiento').value = c.fecha_nacimiento ? c.fecha_nacimiento.slice(0, 10) : '';
    $('campo-genero').value = c.genero || '';
    $('campo-direccion').value = c.direccion || '';
    $('campo-ciudad').value = c.ciudad || '';
    $('campo-departamento').value = c.departamento || '';
    $('campo-notas').value = c.notas || '';
    $('campo-activo').checked = c.activo !== false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function obtenerDatosForm() {
    return {
      tipo_id: $('campo-tipo-id').value,
      numero_id: $('campo-numero-id').value.trim(),
      primer_nombre: $('campo-primer-nombre').value.trim(),
      segundo_nombre: $('campo-segundo-nombre').value.trim() || null,
      primer_apellido: $('campo-primer-apellido').value.trim(),
      segundo_apellido: $('campo-segundo-apellido').value.trim() || null,
      email: $('campo-email').value.trim() || null,
      celular: $('campo-celular').value.trim() || null,
      telefono: $('campo-telefono').value.trim() || null,
      fecha_nacimiento: $('campo-fecha-nacimiento').value || null,
      genero: $('campo-genero').value || null,
      direccion: $('campo-direccion').value.trim() || null,
      ciudad: $('campo-ciudad').value.trim() || null,
      departamento: $('campo-departamento').value.trim() || null,
      notas: $('campo-notas').value.trim() || null,
      activo: $('campo-activo').checked
    };
  }

  async function guardar() {
    if (_guardando) return;
    var nombre = $('campo-primer-nombre').value.trim();
    var apellido = $('campo-primer-apellido').value.trim();
    var numId = $('campo-numero-id').value.trim();
    if (!nombre) { mostrarToast('El primer nombre es obligatorio'); return; }
    if (!apellido) { mostrarToast('El primer apellido es obligatorio'); return; }
    if (!numId) { mostrarToast('El numero de identificacion es obligatorio'); return; }

    _guardando = true;
    $('btn-guardar').disabled = true;
    $('btn-guardar').textContent = 'Guardando...';

    try {
      var data = obtenerDatosForm();
      var res;
      if (EDITANDO_ID) {
        res = await DB.clientes.actualizar(EDITANDO_ID, data);
        if (!res.error) mostrarToast('Cliente actualizado');
      } else {
        res = await DB.clientes.crear(data);
        if (!res.error) mostrarToast('Cliente creado');
      }

      if (res.error) { mostrarToast('Error: ' + res.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar Cliente'; return; }

      limpiarFormulario();
      await cargarClientes();
    } catch (e) {
      console.error('[Clientes] Error guardar:', e);
      mostrarToast('Error inesperado');
    }

    _guardando = false;
    $('btn-guardar').disabled = false;
    $('btn-guardar').textContent = 'Guardar Cliente';
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    var r = await DB.clientes.eliminar(id);
    if (r.error) { mostrarToast('Error: ' + r.error); return; }
    mostrarToast('Cliente eliminado');
    if (EDITANDO_ID === id) limpiarFormulario();
    await cargarClientes();
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

    $('btn-guardar').addEventListener('click', guardar);
    $('btn-limpiar-form').addEventListener('click', limpiarFormulario);
    $('buscador-clientes').addEventListener('input', filtrarYRender);

    $('pag-controles').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'pag-prev') irPagina(PAGINA - 1);
      if (btn.id === 'pag-next') irPagina(PAGINA + 1);
    });

    $('clientes-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-editar')) cargarEnForm(btn.dataset.id);
      if (btn.classList.contains('btn-eliminar')) eliminar(btn.dataset.id);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
