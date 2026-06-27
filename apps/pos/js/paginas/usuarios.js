(function () {
  'use strict';

  var USUARIOS = [];
  var USUARIOS_FILTRADOS = [];
  var ROLES = [];
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

    // Solo usuarios con permiso pos.usuarios.* pueden gestionar usuarios
    if (!window.KubitAuth.tienePermiso('pos.usuarios.*')) {
      mostrarToast('No tienes permiso para gestionar usuarios', 'error');
      window.location.href = 'panel.html';
      return;
    }
    window.KubitAuth.aplicarRestriccionesUI();

    await Promise.all([cargarRoles(), cargarUsuarios()]);
    bindearEventos();
  }

  async function cargarRoles() {
    var res = await DB.roles.listar();
    if (res.error) {
      console.error('[Usuarios] Error roles:', res.error);
      return;
    }
    ROLES = res.data || [];
    var select = $('campo-rol');
    select.innerHTML = '<option value="">— Seleccionar Rol —</option>' +
      ROLES.map(function (r) {
        return '<option value="' + r.id + '">' + r.nombre + '</option>';
      }).join('');
  }

  async function cargarUsuarios() {
    $('usuarios-tbody').innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Cargando...</td></tr>';
    PAGINA = 1;
    var res = await DB.usuarios.listar();
    if (res.error) {
      console.error('[Usuarios] Error:', res.error);
      $('usuarios-tbody').innerHTML = '<tr><td colspan="6" class="text-center py-10 text-slate-400">Error al cargar usuarios</td></tr>';
      return;
    }
    USUARIOS = res.data || [];
    filtrarYRender();
  }

  function renderizarPaginacion() {
    var total = USUARIOS_FILTRADOS.length;
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
    var total = USUARIOS_FILTRADOS.length;
    var paginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (n < 1 || n > paginas) return;
    PAGINA = n;
    renderizarTabla();
    $('usuarios-tbody').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderizarTabla() {
    var tbody = $('usuarios-tbody');
    var total = USUARIOS_FILTRADOS.length;
    $('usuarios-count').textContent = '(' + total + ')';
    if (!total) {
      tbody.innerHTML = '';
      $('usuarios-empty').classList.remove('hidden');
      renderizarPaginacion();
      return;
    }
    $('usuarios-empty').classList.add('hidden');

    var inicio = (PAGINA - 1) * PAGE_SIZE;
    var pagina = USUARIOS_FILTRADOS.slice(inicio, inicio + PAGE_SIZE);

    tbody.innerHTML = pagina.map(function (u) {
      var rolNombre = u.rol && u.rol.nombre ? u.rol.nombre : '—';
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-2"><span class="text-sm font-medium text-slate-950 dark:text-white">' + (u.nombre_completo || '—') + '</span></td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell font-mono">' + (u.usuario || '—') + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">' + (u.email || '—') + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">' + rolNombre + '</td>' +
        '<td class="py-3 px-2 text-center"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + (u.activo !== false ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400') + '">' + (u.activo !== false ? 'Activo' : 'Inactivo') + '</span></td>' +
        '<td class="py-3 px-2 text-right"><div class="flex gap-1 justify-end">' +
        '<button class="btn-editar text-slate-400 hover:text-sky-500 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" data-id="' + u.id + '" aria-label="Editar">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>' +
        '</button>' +
        '<button class="btn-eliminar text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20" data-id="' + u.id + '" aria-label="Eliminar">' +
          '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>' +
        '</button>' +
        '</div></td></tr>';
    }).join('');
    renderizarPaginacion();
  }

  function mostrarOcultarPassword(editando) {
    var esCreacion = !editando;
    $('grupo-password').classList.toggle('hidden', !esCreacion);
    $('grupo-password-confirm').classList.toggle('hidden', !esCreacion);
    $('grupo-cambiar-password').classList.toggle('hidden', esCreacion);

    if (esCreacion) {
      $('campo-password').required = true;
      $('campo-password-confirm').required = true;
    } else {
      $('campo-password').required = false;
      $('campo-password-confirm').required = false;
      var cambiar = $('campo-cambiar-password').checked;
      $('grupo-password').classList.toggle('hidden', !cambiar);
      $('grupo-password-confirm').classList.toggle('hidden', !cambiar);
    }
  }

  function limpiarFormulario() {
    EDITANDO_ID = null;
    $('form-titulo').textContent = 'Nuevo Usuario';
    $('form-usuario-id').textContent = '';
    $('campo-nombre-completo').value = '';
    $('campo-usuario').value = '';
    $('campo-email').value = '';
    $('campo-password').value = '';
    $('campo-password-confirm').value = '';
    $('campo-telefono').value = '';
    $('campo-documento').value = '';
    $('campo-fecha-nacimiento').value = '';
    $('campo-direccion').value = '';
    $('campo-rol').value = '';
    $('campo-activo').checked = true;
    $('campo-cambiar-password').checked = false;
    mostrarOcultarPassword(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cargarEnForm(id) {
    var u = USUARIOS.find(function (x) { return x.id === id; });
    if (!u) return;
    EDITANDO_ID = id;
    $('form-titulo').textContent = 'Editar Usuario';
    $('form-usuario-id').textContent = u.usuario || '';
    $('campo-nombre-completo').value = u.nombre_completo || '';
    $('campo-usuario').value = u.usuario || '';
    $('campo-email').value = u.email || '';
    $('campo-telefono').value = u.telefono || '';
    $('campo-documento').value = u.documento || '';
    $('campo-fecha-nacimiento').value = u.fecha_nacimiento ? u.fecha_nacimiento.slice(0, 10) : '';
    $('campo-direccion').value = u.direccion || '';
    var rolId = typeof u.rol_id === 'object' ? (u.rol_id.id || '') : (u.rol_id || '');
    $('campo-rol').value = rolId;
    $('campo-activo').checked = u.activo !== false;
    $('campo-cambiar-password').checked = false;
    mostrarOcultarPassword(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function obtenerDatosForm() {
    return {
      nombre_completo: $('campo-nombre-completo').value.trim(),
      usuario: $('campo-usuario').value.trim(),
      email: $('campo-email').value.trim(),
      telefono: $('campo-telefono').value.trim() || null,
      documento: $('campo-documento').value.trim() || null,
      fecha_nacimiento: $('campo-fecha-nacimiento').value || null,
      direccion: $('campo-direccion').value.trim() || null,
      rol_id: $('campo-rol').value,
      activo: $('campo-activo').checked
    };
  }

  async function guardar() {
    if (_guardando) return;
    var nombre = $('campo-nombre-completo').value.trim();
    var usuario = $('campo-usuario').value.trim();
    var email = $('campo-email').value.trim();
    var rol = $('campo-rol').value;

    if (!nombre) { mostrarToast('El nombre completo es obligatorio', 'error'); return; }
    if (!usuario) { mostrarToast('El nombre de usuario es obligatorio', 'error'); return; }
    if (!email) { mostrarToast('El email es obligatorio', 'error'); return; }
    if (!rol) { mostrarToast('Debes seleccionar un rol', 'error'); return; }

    if (!EDITANDO_ID) {
      var password = $('campo-password').value;
      var passwordConfirm = $('campo-password-confirm').value;
      if (!password || password.length < 6) { mostrarToast('La contrasena debe tener al menos 6 caracteres', 'error'); return; }
      if (password !== passwordConfirm) { mostrarToast('Las contrasenas no coinciden', 'error'); return; }
    }

    if (EDITANDO_ID && $('campo-cambiar-password').checked) {
      var newPass = $('campo-password').value;
      var newPassConfirm = $('campo-password-confirm').value;
      if (!newPass || newPass.length < 6) { mostrarToast('La contrasena debe tener al menos 6 caracteres', 'error'); return; }
      if (newPass !== newPassConfirm) { mostrarToast('Las contrasenas no coinciden', 'error'); return; }
    }

    _guardando = true;
    $('btn-guardar').disabled = true;
    $('btn-guardar').textContent = 'Guardando...';

    try {
      var data = obtenerDatosForm();
      var res;

      if (EDITANDO_ID) {
        // Editar: actualizar datos en DB
        res = await DB.usuarios.actualizar(EDITANDO_ID, data);
        if (res.error) { mostrarToast('Error: ' + res.error, 'error'); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar Usuario'; return; }

        // Si se solicita cambio de contrasena
        if ($('campo-cambiar-password').checked) {
          var passRes = await DB.usuarios.actualizarPassword(EDITANDO_ID, $('campo-password').value);
          if (passRes.error) { mostrarToast('Usuario actualizado, pero error al cambiar contrasena: ' + passRes.error, 'error'); }
        }
        mostrarToast('Usuario actualizado', 'success');
      } else {
        // Crear: crear en Auth + DB
        res = await DB.usuarios.crearConAuth(data, $('campo-password').value);
        if (res.error) { mostrarToast('Error: ' + res.error, 'error'); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar Usuario'; return; }
        mostrarToast('Usuario creado exitosamente', 'success');
      }

      limpiarFormulario();
      await cargarUsuarios();
    } catch (e) {
      console.error('[Usuarios] Error guardar:', e);
      mostrarToast('Error inesperado', 'error');
    }

    _guardando = false;
    $('btn-guardar').disabled = false;
    $('btn-guardar').textContent = 'Guardar Usuario';
  }

  async function eliminar(id) {
    if (!confirm('\u00BFEliminar este usuario?')) return;
    var r = await DB.usuarios.eliminar(id);
    if (r.error) { mostrarToast('Error: ' + r.error, 'error'); return; }
    mostrarToast('Usuario eliminado', 'success');
    if (EDITANDO_ID === id) limpiarFormulario();
    await cargarUsuarios();
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

  function filtrarYRender() {
    var q = ($('buscador-usuarios').value || '').toLowerCase().trim();
    USUARIOS_FILTRADOS = USUARIOS.filter(function (u) {
      var nombre = (u.nombre_completo || '').toLowerCase();
      var usr = (u.usuario || '').toLowerCase();
      var email = (u.email || '').toLowerCase();
      var doc = (u.documento || '').toLowerCase();
      return nombre.includes(q) || usr.includes(q) || email.includes(q) || doc.includes(q);
    });
    PAGINA = 1;
    renderizarTabla();
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
    $('buscador-usuarios').addEventListener('input', filtrarYRender);

    // Checkbox "Cambiar contrasena" en edicion
    $('campo-cambiar-password').addEventListener('change', function () {
      mostrarOcultarPassword(true);
    });

    $('pag-controles').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.id === 'pag-prev') irPagina(PAGINA - 1);
      if (btn.id === 'pag-next') irPagina(PAGINA + 1);
    });

    $('usuarios-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-editar')) cargarEnForm(btn.dataset.id);
      if (btn.classList.contains('btn-eliminar')) eliminar(btn.dataset.id);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
