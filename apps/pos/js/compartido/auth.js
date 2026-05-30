/* ============================================================
   auth.js — Sistema de roles y permisos (mock + preparado para Supabase)
   Basado en pos_roles, pos_permisos, pos_rol_permisos del spec §5
   ============================================================ */

window.KubitAuth = (function () {

  /* ─── ROLES (mapeo a pos_roles) ─── */
  var ROLES = {
    admin:       { id: 'r1', nombre: 'Administrador', nivel: 100 },
    supervisor:  { id: 'r2', nombre: 'Supervisor',    nivel: 80 },
    cajero:      { id: 'r3', nombre: 'Cajero',        nivel: 30 },
    vendedor:    { id: 'r4', nombre: 'Vendedor',      nivel: 40 },
    almacenista: { id: 'r5', nombre: 'Almacenista',   nivel: 50 },
    contador:    { id: 'r6', nombre: 'Contador',      nivel: 60 },
  };

  /* ─── PERMISOS por rol (mapeo a pos_rol_permisos) ─── */
  var PERMISOS_POR_ROL = {
    admin: [
      'pos.ventas.*', 'pos.ventas.crear', 'pos.ventas.anular',
      'pos.caja.*', 'pos.caja.apertura', 'pos.caja.cierre', 'pos.caja.cierre_forzado',
      'pos.inventario.*', 'pos.inventario.ajuste',
      'pos.compras.*', 'pos.compras.crear', 'pos.compras.recibir',
      'pos.facturacion.*', 'pos.facturacion.emitir', 'pos.facturacion.anular',
      'pos.finanzas.*', 'pos.finanzas.ver',
      'pos.config.*',
      'pos.usuarios.*',
      'pos.descuento.alto',
    ],
    supervisor: [
      'pos.ventas.*', 'pos.ventas.anular',
      'pos.caja.*', 'pos.caja.cierre_forzado',
      'pos.inventario.*',
      'pos.compras.*',
      'pos.facturacion.*',
      'pos.finanzas.ver',
      'pos.descuento.alto',
    ],
    cajero: [
      'pos.ventas.crear',
      'pos.caja.apertura', 'pos.caja.cierre',
    ],
    vendedor: [
      'pos.ventas.crear',
      'pos.caja.apertura', 'pos.caja.cierre',
    ],
    almacenista: [
      'pos.inventario.*', 'pos.inventario.ajuste',
      'pos.compras.*', 'pos.compras.crear', 'pos.compras.recibir',
    ],
    contador: [
      'pos.facturacion.*', 'pos.facturacion.emitir',
      'pos.finanzas.*', 'pos.finanzas.ver',
    ],
  };

  /* ─── USUARIOS MOCK (simula pos_usuarios) ─── */
  var USUARIOS_MOCK = [
    { usuario: 'admin',   password: 'admin',   nombre: 'Admin Sistema', rol: 'admin' },
    { usuario: 'cajero1', password: 'caja',     nombre: 'Carlos Caja',   rol: 'cajero' },
    { usuario: 'vendedor',password: 'venta',    nombre: 'Vicky Ventas',  rol: 'vendedor' },
    { usuario: 'supervisor1', password: 'super', nombre: 'Sofia Sup',    rol: 'supervisor' },
  ];

  var usuarioActual = null;

  /* ─── INICIAR SESIÓN ─── */
  function login(usuario, password, cajaId, cajaNombre) {
    var encontrado = USUARIOS_MOCK.find(function (u) {
      return u.usuario === usuario && u.password === password;
    });
    if (!encontrado) return null;

    var rol = ROLES[encontrado.rol];
    if (!rol) return null;

    usuarioActual = {
      id: 'u_' + encontrado.rol,
      nombre: encontrado.nombre,
      usuario: encontrado.usuario,
      rolId: rol.id,
      rolNombre: rol.nombre,
      rolClave: encontrado.rol,
      nivel: rol.nivel,
      cajaId: cajaId,
      cajaNombre: cajaNombre,
    };

    guardarSesion();
    return usuarioActual;
  }

  /* ─── CERRAR SESIÓN ─── */
  function logout() {
    usuarioActual = null;
    localStorage.removeItem('kubit_sesion');
  }

  /* ─── GUARDAR / CARGAR SESIÓN ─── */
  function guardarSesion() {
    if (usuarioActual) localStorage.setItem('kubit_sesion', JSON.stringify(usuarioActual));
  }

  function cargarSesion() {
    var data = localStorage.getItem('kubit_sesion');
    if (data) {
      try { usuarioActual = JSON.parse(data); } catch (e) { usuarioActual = null; }
    }
    return usuarioActual;
  }

  /* ─── VERIFICAR PERMISO ─── */
  function tienePermiso(permiso) {
    if (!usuarioActual) return false;
    var permisos = PERMISOS_POR_ROL[usuarioActual.rolClave] || [];
    if (permisos.indexOf('pos.*') > -1 || permisos.indexOf('pos.' + permiso.split('.')[1] + '.*') > -1) return true;
    return permisos.indexOf(permiso) > -1;
  }

  function requierePermiso(permiso) {
    if (!tienePermiso(permiso)) {
      mostrarErrorPermiso();
      return false;
    }
    return true;
  }

  function mostrarErrorPermiso() {
    var toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = 'No tienes permiso para realizar esta acción';
      toast.classList.add('show');
      clearTimeout(toast._timer);
      toast._timer = setTimeout(function () { toast.classList.remove('show'); }, 3000);
    }
  }

  /* ─── OCULTAR ELEMENTOS SEGÚN ROL ─── */
  function aplicarRestriccionesUI() {
    if (!usuarioActual) return;

    document.querySelectorAll('[data-permiso]').forEach(function (el) {
      var permisoRequerido = el.dataset.permiso;
      if (!tienePermiso(permisoRequerido)) {
        el.classList.add('hidden');
      }
    });

    document.querySelectorAll('[data-rol-minimo]').forEach(function (el) {
      var nivelRequerido = parseInt(el.dataset.rolMinimo);
      if (usuarioActual.nivel < nivelRequerido) {
        el.classList.add('hidden');
      }
    });
  }

  /* ─── API PÚBLICA ─── */
  return {
    login: login,
    logout: logout,
    cargarSesion: cargarSesion,
    obtenerUsuario: function () { return usuarioActual; },
    tienePermiso: tienePermiso,
    requierePermiso: requierePermiso,
    aplicarRestriccionesUI: aplicarRestriccionesUI,
    ROLES: ROLES,
  };

})();