(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     STATE — datos desde Supabase via DatabaseService
     ════════════════════════════════════════════════════════════ */
  var CAJAS = [];
  var APERTURA_ACTIVA = null;
  var HISTORIAL = [];
  var VENTAS_PERIODO = [];
  var _loading = false;

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  /* ════════════════════════════════════════════════════════════
     INICIALIZACIÓN ASÍNCRONA
     ════════════════════════════════════════════════════════════ */
  async function init() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');

    window.KubitAuth.cargarSesion();
    var user = window.KubitAuth.obtenerUsuario();
    if (!user) { window.location.href = 'login.html'; return; }

    window.KubitAuth.aplicarRestriccionesUI();

    mostrarInfo();
    await cargarCajas();
    await cargarEstado();
    bindearEventos();
  }

  /* ════════════════════════════════════════════════════════════
     UI
     ════════════════════════════════════════════════════════════ */
  function mostrarInfo() {
    var user = window.KubitAuth.obtenerUsuario();
    $('caja-info').textContent = (user ? user.nombre : 'Usuario') + ' · Control de Caja';

    var ahora = new Date();
    var opts = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    $('fecha-actual').textContent = ahora.toLocaleDateString('es-CO', opts);
    setInterval(function () {
      var a = new Date();
      $('fecha-actual').textContent = a.toLocaleDateString('es-CO', opts);
    }, 30000);
  }

  function obtenerCajaId() {
    return $('select-caja').value;
  }

  function obtenerCaja() {
    return CAJAS.find(function (c) { return c.id === obtenerCajaId(); });
  }

  function actualizarUI() {
    var abierta = APERTURA_ACTIVA && APERTURA_ACTIVA.estado === 'ABIERTA';

    $('caja-estado-info').textContent = abierta
      ? APERTURA_ACTIVA.nombreCaja + ' · ABIERTA desde ' + formatearFecha(APERTURA_ACTIVA.fecha_apertura)
      : $('select-caja').options[$('select-caja').selectedIndex].text + ' · CERRADA';

    $('panel-estado').classList.toggle('hidden', !abierta);
    $('btn-apertura').classList.toggle('hidden', abierta);
    $('btn-cierre').classList.toggle('hidden', !abierta);

    if (abierta) {
      var ventasEfectivo = VENTAS_PERIODO.filter(function (v) { return v.metodo_pago === 'efectivo'; })
        .reduce(function (s, v) { return s + (v.total || 0); }, 0);
      var ventasTotal = VENTAS_PERIODO.reduce(function (s, v) { return s + (v.total || 0); }, 0);

      $('monto-inicial').textContent = formatearMoneda(APERTURA_ACTIVA.monto_inicial || 0);
      $('ventas-efectivo').textContent = formatearMoneda(ventasEfectivo);
      $('ventas-total').textContent = formatearMoneda(ventasTotal);
      $('apertura-desde').textContent = formatearFecha(APERTURA_ACTIVA.fecha_apertura);
    }

    renderizarHistorial();
  }

  function renderizarHistorial() {
    var container = $('lista-movimientos');
    if (!HISTORIAL.length) {
      container.innerHTML = '<div class="text-center text-sm text-slate-400 py-8">No hay movimientos registrados</div>';
      return;
    }
    container.innerHTML = HISTORIAL.slice().reverse().map(function (h) {
      var esApertura = h.estado === 'ABIERTA';
      return '<div class="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">' +
        '<div class="flex items-center gap-3">' +
        '<div class="w-8 h-8 rounded-full ' + (esApertura ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30') + ' flex items-center justify-center">' +
        '<svg class="w-4 h-4 ' + (esApertura ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400') + '" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
        (esApertura
          ? '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>'
          : '<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>') +
        '</svg></div>' +
        '<div><p class="text-sm font-medium text-slate-950 dark:text-white">' + (esApertura ? 'Apertura' : 'Cierre') + '</p>' +
        '<p class="text-xs text-slate-400">' + formatearFecha(h.fecha_apertura) + '</p></div></div>' +
        '<span class="text-sm font-semibold ' + (esApertura ? 'text-emerald-600' : 'text-red-600') + '">' + formatearMoneda(h.monto_inicial || 0) + '</span>' +
        '</div>';
    }).join('');
  }

  function formatearMoneda(valor) {
    return '$' + valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatearFecha(iso) {
    if (!iso) return '--';
    var d = new Date(iso);
    return d.toLocaleString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function mostrarToast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

  /* ════════════════════════════════════════════════════════════
     CARGA DE DATOS DESDE SUPABASE
     ════════════════════════════════════════════════════════════ */
  async function cargarCajas() {
    var res = await DB.cajas.listar();
    if (res.error) {
      console.error('[Caja] Error cargando cajas:', res.error);
      return;
    }
    CAJAS = res.data || [];

    var select = $('select-caja');
    select.innerHTML = '';
    CAJAS.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      select.appendChild(opt);
    });

    // Seleccionar la caja del login si existe
    var cajaLoginId = localStorage.getItem('pos_caja_id');
    if (cajaLoginId && CAJAS.some(function (c) { return c.id === cajaLoginId; })) {
      select.value = cajaLoginId;
    }
  }

  async function cargarEstado() {
    var cajaId = obtenerCajaId();
    if (!cajaId) return;

    APERTURA_ACTIVA = null;
    HISTORIAL = [];
    VENTAS_PERIODO = [];

    // Obtener apertura activa
    var resActiva = await DB.cajaApertura.obtenerActiva(cajaId);
    if (resActiva.data) {
      APERTURA_ACTIVA = resActiva.data;
    }

    // Obtener historial
    var resHistorial = await DB.cajaApertura.historial(cajaId, { limit: 50 });
    if (!resHistorial.error) {
      HISTORIAL = resHistorial.data || [];
    }

    // Si hay apertura activa, obtener ventas del período
    if (APERTURA_ACTIVA) {
      var user = window.KubitAuth.obtenerUsuario();
      var resVentas = await DB.ventas.obtenerPorPeriodo(
        user ? user.id : null,
        APERTURA_ACTIVA.fecha_apertura,
        new Date().toISOString()
      );
      if (!resVentas.error) {
        VENTAS_PERIODO = resVentas.data || [];
      }
    }

    actualizarUI();
  }

  /* ════════════════════════════════════════════════════════════
     APERTURA
     ════════════════════════════════════════════════════════════ */
  function abrirModalApertura() {
    $('monto-inicial-input').value = 0;
    $('modal-apertura').classList.remove('hidden');
    setTimeout(function () { $('monto-inicial-input').focus(); }, 100);
  }

  function cerrarModalApertura() {
    $('modal-apertura').classList.add('hidden');
  }

  async function confirmarApertura() {
    if (_loading) return;
    if (!window.KubitAuth.requierePermiso('pos.caja.apertura')) return;

    var monto = parseFloat($('monto-inicial-input').value) || 0;
    if (monto < 0) { mostrarToast('El monto inicial no puede ser negativo'); return; }

    var cajaId = obtenerCajaId();
    if (!cajaId) { mostrarToast('Selecciona una caja'); return; }

    if (APERTURA_ACTIVA) { mostrarToast('La caja ya está abierta'); return; }

    _loading = true;
    $('btn-confirmar-apertura').disabled = true;
    $('btn-confirmar-apertura').textContent = 'Abriendo...';

    try {
      var user = window.KubitAuth.obtenerUsuario();
      var res = await DB.cajaApertura.abrir({
        caja_id: cajaId,
        cajero_id: user.id,
        fecha_apertura: new Date().toISOString(),
        monto_inicial: monto,
        estado: 'ABIERTA'
      });

      if (res.error) {
        mostrarToast('Error al abrir caja: ' + res.error);
      } else {
        await cargarEstado();
        mostrarToast('Caja abierta con ' + formatearMoneda(monto));
        cerrarModalApertura();
      }
    } catch (e) {
      console.error('[Caja] Error en apertura:', e);
      mostrarToast('Error inesperado');
    }

    _loading = false;
    $('btn-confirmar-apertura').disabled = false;
    $('btn-confirmar-apertura').textContent = 'Abrir Caja';
  }

  /* ════════════════════════════════════════════════════════════
     CIERRE
     ════════════════════════════════════════════════════════════ */
  function abrirModalCierre() {
    if (!window.KubitAuth.requierePermiso('pos.caja.cierre')) return;

    if (!APERTURA_ACTIVA) { mostrarToast('La caja no está abierta'); return; }

    var ventasEfectivo = VENTAS_PERIODO.filter(function (v) { return v.metodo_pago === 'efectivo'; })
      .reduce(function (s, v) { return s + (v.total || 0); }, 0);
    var esperado = (APERTURA_ACTIVA.monto_inicial || 0) + ventasEfectivo;

    $('cierre-monto-inicial').textContent = formatearMoneda(APERTURA_ACTIVA.monto_inicial || 0);
    $('cierre-ventas-efectivo').textContent = formatearMoneda(ventasEfectivo);
    $('cierre-monto-esperado').textContent = formatearMoneda(esperado);
    $('monto-final-input').value = '';
    $('cierre-diferencia').classList.add('hidden');

    var puedeForzado = window.KubitAuth.tienePermiso('pos.caja.cierre_forzado');
    $('btn-cierre-forzado').classList.toggle('hidden', !puedeForzado);

    $('modal-cierre').classList.remove('hidden');
    setTimeout(function () { $('monto-final-input').focus(); }, 100);
  }

  function cerrarModalCierre() {
    $('modal-cierre').classList.add('hidden');
  }

  async function confirmarCierre(forzado) {
    if (_loading) return;
    if (!APERTURA_ACTIVA) return;

    var ventasEfectivo = VENTAS_PERIODO.filter(function (v) { return v.metodo_pago === 'efectivo'; })
      .reduce(function (s, v) { return s + (v.total || 0); }, 0);
    var esperado = (APERTURA_ACTIVA.monto_inicial || 0) + ventasEfectivo;
    var montoFinal;

    if (!forzado) {
      montoFinal = parseFloat($('monto-final-input').value);
      if (isNaN(montoFinal) || montoFinal < 0) {
        mostrarToast('Ingresa un monto final válido');
        return;
      }
    } else {
      montoFinal = esperado;
    }

    var diferencia = montoFinal - esperado;

    _loading = true;
    $('btn-confirmar-cierre').disabled = true;
    $('btn-confirmar-cierre').textContent = 'Cerrando...';

    try {
      var res = await DB.cajaApertura.cerrar(APERTURA_ACTIVA.id, montoFinal, esperado, diferencia);
      if (res.error) {
        mostrarToast('Error al cerrar caja: ' + res.error);
      } else {
        await cargarEstado();
        cerrarModalCierre();

        var msg = 'Caja cerrada' + (forzado ? ' (forzado)' : '');
        if (diferencia !== 0) msg += ' · Diferencia: ' + formatearMoneda(diferencia);
        mostrarToast(msg);
      }
    } catch (e) {
      console.error('[Caja] Error en cierre:', e);
      mostrarToast('Error inesperado');
    }

    _loading = false;
    $('btn-confirmar-cierre').disabled = false;
    $('btn-confirmar-cierre').textContent = 'Cerrar Caja';
  }

  /* ════════════════════════════════════════════════════════════
     EVENTOS
     ════════════════════════════════════════════════════════════ */
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

    $('select-caja').addEventListener('change', function () {
      cargarEstado();
    });

    $('btn-apertura').addEventListener('click', abrirModalApertura);
    $('btn-cerrar-modal-apertura').addEventListener('click', cerrarModalApertura);
    $('modal-apertura').addEventListener('click', function (e) {
      if (e.target === $('modal-apertura')) cerrarModalApertura();
    });
    $('btn-confirmar-apertura').addEventListener('click', confirmarApertura);

    $('btn-cierre').addEventListener('click', abrirModalCierre);
    $('btn-cerrar-modal-cierre').addEventListener('click', cerrarModalCierre);
    $('modal-cierre').addEventListener('click', function (e) {
      if (e.target === $('modal-cierre')) cerrarModalCierre();
    });
    $('btn-confirmar-cierre').addEventListener('click', function () { confirmarCierre(false); });
    $('btn-cierre-forzado').addEventListener('click', function () { confirmarCierre(true); });

    $('monto-final-input').addEventListener('input', function () {
      if (!APERTURA_ACTIVA) return;
      var ventasEfectivo = VENTAS_PERIODO.filter(function (v) { return v.metodo_pago === 'efectivo'; })
        .reduce(function (s, v) { return s + (v.total || 0); }, 0);
      var esperado = (APERTURA_ACTIVA.monto_inicial || 0) + ventasEfectivo;
      var montoFinal = parseFloat(this.value) || 0;
      var diff = montoFinal - esperado;
      $('cierre-diferencia').classList.remove('hidden');
      $('cierre-diferencia-monto').textContent = formatearMoneda(diff);
      $('cierre-diferencia-monto').className = 'font-semibold ' + (diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!$('modal-apertura').classList.contains('hidden')) cerrarModalApertura();
        else if (!$('modal-cierre').classList.contains('hidden')) cerrarModalCierre();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
