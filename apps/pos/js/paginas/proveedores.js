(function () {
  'use strict';

  var PROVEEDORES = [];
  var PROVEEDORES_FILTRADOS = [];
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

    await cargarProveedores();
    bindearEventos();
  }

  async function cargarProveedores() {
    $('proveedores-tbody').innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Cargando...</td></tr>';
    PAGINA = 1;
    var res = await DB.proveedores.listar();
    if (res.error) {
      console.error('[Proveedores] Error:', res.error);
      $('proveedores-tbody').innerHTML = '<tr><td colspan="6" class="text-center py-10 text-slate-400">Error al cargar proveedores</td></tr>';
      return;
    }
    PROVEEDORES = res.data || [];
    filtrarYRender();
  }

  function renderizarPaginacion() {
    var total = PROVEEDORES_FILTRADOS.length;
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
    var total = PROVEEDORES_FILTRADOS.length;
    var paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (n < 1 || n > paginas) return;
    PAGINA = n;
    renderizarTabla();
    $('proveedores-tbody').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderizarTabla() {
    var tbody = $('proveedores-tbody');
    var total = PROVEEDORES_FILTRADOS.length;
    $('proveedores-count').textContent = '(' + total + ')';
    if (!total) {
      tbody.innerHTML = '';
      $('proveedores-empty').classList.remove('hidden');
      renderizarPaginacion();
      return;
    }
    $('proveedores-empty').classList.add('hidden');

    var inicio = (PAGINA - 1) * PAGE_SIZE;
    var pagina = PROVEEDORES_FILTRADOS.slice(inicio, inicio + PAGE_SIZE);

    tbody.innerHTML = pagina.map(function (p) {
      var doc = (p.tipo_id || '') + ' ' + (p.numero_id || '');
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-2"><span class="text-sm font-medium text-slate-950 dark:text-white">' + (p.razon_social || '—') + '</span></td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">' + (doc || '—') + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">' + (p.persona_contacto || '—') + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">' + (p.email || '—') + '</td>' +
        '<td class="py-3 px-2 text-center"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + (p.activo !== false ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400') + '">' + (p.activo !== false ? 'Activo' : 'Inactivo') + '</span></td>' +
        '<td class="py-3 px-2 text-right"><div class="flex gap-1 justify-end">' +
        '<button class="btn-editar text-slate-400 hover:text-sky-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" data-id="' + p.id + '" aria-label="Editar">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>' +
        '</button>' +
        '<button class="btn-eliminar text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20" data-id="' + p.id + '" aria-label="Eliminar">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>' +
        '</button>' +
        '</div></td></tr>';
    }).join('');
    renderizarPaginacion();
  }

  function filtrarYRender() {
    var q = ($('buscador-proveedores').value || '').toLowerCase().trim();
    PROVEEDORES_FILTRADOS = PROVEEDORES.filter(function (p) {
      var rs = (p.razon_social || '').toLowerCase();
      var doc = ((p.tipo_id || '') + ' ' + (p.numero_id || '')).toLowerCase();
      var email = (p.email || '').toLowerCase();
      return rs.includes(q) || doc.includes(q) || email.includes(q);
    });
    PAGINA = 1;
    renderizarTabla();
  }

  function limpiarFormulario() {
    EDITANDO_ID = null;
    $('form-titulo').textContent = 'Nuevo Proveedor';
    $('form-proveedor-id').textContent = '';
    $('campo-tipo-id').value = 'NIT';
    $('campo-numero-id').value = '';
    $('campo-razon-social').value = '';
    $('campo-nombre-comercial').value = '';
    $('campo-codigo').value = '';
    $('campo-categoria').value = '';
    $('campo-contacto').value = '';
    $('campo-email').value = '';
    $('campo-celular').value = '';
    $('campo-telefono').value = '';
    $('campo-sitio-web').value = '';
    $('campo-direccion').value = '';
    $('campo-ciudad').value = '';
    $('campo-departamento').value = '';
    $('campo-terminos-pago').value = '';
    $('campo-limite-credito').value = '';
    $('campo-notas').value = '';
    $('campo-activo').checked = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cargarEnForm(id) {
    var p = PROVEEDORES.find(function (x) { return x.id === id; });
    if (!p) return;
    EDITANDO_ID = id;
    $('form-titulo').textContent = 'Editar Proveedor';
    $('form-proveedor-id').textContent = p.razon_social;
    $('campo-tipo-id').value = p.tipo_id || 'NIT';
    $('campo-numero-id').value = p.numero_id || '';
    $('campo-razon-social').value = p.razon_social || '';
    $('campo-nombre-comercial').value = p.nombre_comercial || '';
    $('campo-codigo').value = p.codigo || '';
    $('campo-categoria').value = p.categoria || '';
    $('campo-contacto').value = p.persona_contacto || '';
    $('campo-email').value = p.email || '';
    $('campo-celular').value = p.celular || '';
    $('campo-telefono').value = p.telefono || '';
    $('campo-sitio-web').value = p.sitio_web || '';
    $('campo-direccion').value = p.direccion || '';
    $('campo-ciudad').value = p.ciudad || '';
    $('campo-departamento').value = p.departamento || '';
    $('campo-terminos-pago').value = p.terminos_pago || '';
    $('campo-limite-credito').value = p.limite_credito || '';
    $('campo-notas').value = p.notas || '';
    $('campo-activo').checked = p.activo !== false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function obtenerDatosForm() {
    return {
      tipo_id: $('campo-tipo-id').value,
      numero_id: $('campo-numero-id').value.trim(),
      razon_social: $('campo-razon-social').value.trim(),
      nombre_comercial: $('campo-nombre-comercial').value.trim() || null,
      codigo: $('campo-codigo').value.trim() || null,
      categoria: $('campo-categoria').value.trim() || null,
      persona_contacto: $('campo-contacto').value.trim() || null,
      email: $('campo-email').value.trim() || null,
      celular: $('campo-celular').value.trim() || null,
      telefono: $('campo-telefono').value.trim() || null,
      sitio_web: $('campo-sitio-web').value.trim() || null,
      direccion: $('campo-direccion').value.trim() || null,
      ciudad: $('campo-ciudad').value.trim() || null,
      departamento: $('campo-departamento').value.trim() || null,
      terminos_pago: $('campo-terminos-pago').value.trim() || null,
      limite_credito: $('campo-limite-credito').value ? parseFloat($('campo-limite-credito').value) : null,
      notas: $('campo-notas').value.trim() || null,
      activo: $('campo-activo').checked
    };
  }

  async function guardar() {
    if (_guardando) return;
    var rs = $('campo-razon-social').value.trim();
    var numId = $('campo-numero-id').value.trim();
    if (!rs) { mostrarToast('La razon social es obligatoria'); return; }
    if (!numId) { mostrarToast('El numero de identificacion es obligatorio'); return; }

    _guardando = true;
    $('btn-guardar').disabled = true;
    $('btn-guardar').textContent = 'Guardando...';

    try {
      var data = obtenerDatosForm();
      var res;
      if (EDITANDO_ID) {
        res = await DB.proveedores.actualizar(EDITANDO_ID, data);
        if (!res.error) mostrarToast('Proveedor actualizado');
      } else {
        res = await DB.proveedores.crear(data);
        if (!res.error) mostrarToast('Proveedor creado');
      }

      if (res.error) { mostrarToast('Error: ' + res.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar Proveedor'; return; }

      limpiarFormulario();
      await cargarProveedores();
    } catch (e) {
      console.error('[Proveedores] Error guardar:', e);
      mostrarToast('Error inesperado');
    }

    _guardando = false;
    $('btn-guardar').disabled = false;
    $('btn-guardar').textContent = 'Guardar Proveedor';
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este proveedor?')) return;
    var r = await DB.proveedores.eliminar(id);
    if (r.error) { mostrarToast('Error: ' + r.error); return; }
    mostrarToast('Proveedor eliminado');
    if (EDITANDO_ID === id) limpiarFormulario();
    await cargarProveedores();
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
    $('buscador-proveedores').addEventListener('input', filtrarYRender);

    $('pag-controles').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'pag-prev') irPagina(PAGINA - 1);
      if (btn.id === 'pag-next') irPagina(PAGINA + 1);
    });

    $('proveedores-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-editar')) cargarEnForm(btn.dataset.id);
      if (btn.classList.contains('btn-eliminar')) eliminar(btn.dataset.id);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
