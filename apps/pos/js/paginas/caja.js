(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     ESTADO MOCK (simula pos_caja_apertura)
     ════════════════════════════════════════════════════════════ */
  var CAJAS_MOCK = {
    c1: { nombre: 'Caja Principal', estado: 'CERRADA', montoInicial: 0, apertura: null, ventasEfectivo: 0, ventasTotal: 0 },
    c2: { nombre: 'Caja Secundaria', estado: 'CERRADA', montoInicial: 0, apertura: null, ventasEfectivo: 0, ventasTotal: 0 },
  };

  var HISTORIAL = [];

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  /* ════════════════════════════════════════════════════════════
     INICIO
     ════════════════════════════════════════════════════════════ */
  function init() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');

    window.KubitAuth.cargarSesion();
    var user = window.KubitAuth.obtenerUsuario();
    if (!user) { window.location.href = 'login.html'; return; }

    window.KubitAuth.aplicarRestriccionesUI();

    mostrarInfo();
    actualizarUI();

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
    return CAJAS_MOCK[obtenerCajaId()];
  }

  function actualizarUI() {
    var caja = obtenerCaja();
    var abierta = caja.estado === 'ABIERTA';

    $('caja-estado-info').textContent = abierta
      ? caja.nombre + ' · ABIERTA desde ' + caja.apertura
      : caja.nombre + ' · CERRADA';

    $('panel-estado').classList.toggle('hidden', !abierta);
    $('btn-apertura').classList.toggle('hidden', abierta);
    $('btn-cierre').classList.toggle('hidden', !abierta);

    if (abierta) {
      $('monto-inicial').textContent = formatearMoneda(caja.montoInicial);
      $('ventas-efectivo').textContent = formatearMoneda(caja.ventasEfectivo);
      $('ventas-total').textContent = formatearMoneda(caja.ventasTotal);
      $('apertura-desde').textContent = caja.apertura;
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
      var esApertura = h.tipo === 'apertura';
      return '<div class="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">' +
        '<div class="flex items-center gap-3">' +
        '<div class="w-8 h-8 rounded-full ' + (esApertura ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30') + ' flex items-center justify-center">' +
        '<svg class="w-4 h-4 ' + (esApertura ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400') + '" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
        (esApertura
          ? '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>'
          : '<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>') +
        '</svg></div>' +
        '<div><p class="text-sm font-medium text-slate-950 dark:text-white">' + (esApertura ? 'Apertura' : 'Cierre') + '</p>' +
        '<p class="text-xs text-slate-400">' + h.fecha + ' · ' + h.usuario + ' · ' + h.caja + '</p></div></div>' +
        '<span class="text-sm font-semibold ' + (esApertura ? 'text-emerald-600' : 'text-red-600') + '">' + formatearMoneda(h.monto) + '</span>' +
        '</div>';
    }).join('');
  }

  function formatearMoneda(valor) {
    return '$' + valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function mostrarToast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 3000);
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

  function confirmarApertura() {
    if (!window.KubitAuth.requierePermiso('pos.caja.apertura')) return;

    var monto = parseFloat($('monto-inicial-input').value) || 0;
    if (monto < 0) { mostrarToast('El monto inicial no puede ser negativo'); return; }

    var caja = obtenerCaja();
    if (caja.estado === 'ABIERTA') { mostrarToast('La caja ya está abierta'); return; }

    // Verificar que el usuario no tenga otra caja abierta
    var userId = window.KubitAuth.obtenerUsuario().id;
    var tieneOtraAbierta = Object.keys(CAJAS_MOCK).some(function (k) {
      return CAJAS_MOCK[k].estado === 'ABIERTA' && CAJAS_MOCK[k].abiertaPor === userId;
    });
    if (tieneOtraAbierta) { mostrarToast('Ya tienes otra caja abierta'); return; }

    var ahora = new Date();
    var fechaStr = ahora.toLocaleString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    var user = window.KubitAuth.obtenerUsuario();

    caja.estado = 'ABIERTA';
    caja.montoInicial = monto;
    caja.apertura = fechaStr;
    caja.ventasEfectivo = 0;
    caja.ventasTotal = 0;
    caja.abiertaPor = user.id;

    HISTORIAL.push({
      tipo: 'apertura',
      monto: monto,
      fecha: fechaStr,
      usuario: user.nombre,
      caja: caja.nombre,
    });

    cerrarModalApertura();
    actualizarUI();
    mostrarToast('Caja abierta con ' + formatearMoneda(monto));
  }

  /* ════════════════════════════════════════════════════════════
     CIERRE
     ════════════════════════════════════════════════════════════ */
  function abrirModalCierre() {
    if (!window.KubitAuth.requierePermiso('pos.caja.cierre')) return;

    var caja = obtenerCaja();
    if (caja.estado !== 'ABIERTA') { mostrarToast('La caja no está abierta'); return; }

    $('cierre-monto-inicial').textContent = formatearMoneda(caja.montoInicial);
    $('cierre-ventas-efectivo').textContent = formatearMoneda(caja.ventasEfectivo);
    var esperado = caja.montoInicial + caja.ventasEfectivo;
    $('cierre-monto-esperado').textContent = formatearMoneda(esperado);
    $('monto-final-input').value = '';
    $('cierre-diferencia').classList.add('hidden');

    // Mostrar cierre forzado si tiene permiso
    var puedeForzado = window.KubitAuth.tienePermiso('pos.caja.cierre_forzado');
    $('btn-cierre-forzado').classList.toggle('hidden', !puedeForzado);

    $('modal-cierre').classList.remove('hidden');
    setTimeout(function () { $('monto-final-input').focus(); }, 100);
  }

  function cerrarModalCierre() {
    $('modal-cierre').classList.add('hidden');
  }

  function confirmarCierre(forzado) {
    var caja = obtenerCaja();
    var esperado = caja.montoInicial + caja.ventasEfectivo;
    var montoFinal = parseFloat($('monto-final-input').value);
    var user = window.KubitAuth.obtenerUsuario();

    // Si no es forzado, validar monto final
    if (!forzado) {
      if (isNaN(montoFinal) || montoFinal < 0) {
        mostrarToast('Ingresa un monto final válido');
        return;
      }
    } else {
      montoFinal = esperado;
    }

    var diferencia = montoFinal - esperado;

    var ahora = new Date();
    var fechaStr = ahora.toLocaleString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    HISTORIAL.push({
      tipo: 'cierre',
      monto: montoFinal,
      fecha: fechaStr,
      usuario: user.nombre,
      caja: caja.nombre,
      diferencia: diferencia,
    });

    caja.estado = 'CERRADA';
    caja.apertura = null;
    caja.abiertaPor = null;

    cerrarModalCierre();
    actualizarUI();

    var msg = 'Caja cerrada' + (forzado ? ' (forzado)' : '');
    if (diferencia !== 0) msg += ' · Diferencia: ' + formatearMoneda(diferencia);
    mostrarToast(msg);
  }

  /* ════════════════════════════════════════════════════════════
     EVENTOS
     ════════════════════════════════════════════════════════════ */
  function bindearEventos() {
    $('btn-dark').addEventListener('click', function () {
      html.classList.toggle('dark');
      localStorage.setItem('darkMode', html.classList.contains('dark'));
    });

    $('select-caja').addEventListener('change', actualizarUI);

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

    // Calcular diferencia en vivo
    $('monto-final-input').addEventListener('input', function () {
      var caja = obtenerCaja();
      if (caja.estado !== 'ABIERTA') return;
      var esperado = caja.montoInicial + caja.ventasEfectivo;
      var montoFinal = parseFloat(this.value) || 0;
      var diff = montoFinal - esperado;
      $('cierre-diferencia').classList.remove('hidden');
      $('cierre-diferencia-monto').textContent = formatearMoneda(diff);
      $('cierre-diferencia-monto').className = 'font-semibold ' + (diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400');
    });

    // Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!$('modal-apertura').classList.contains('hidden')) cerrarModalApertura();
        else if (!$('modal-cierre').classList.contains('hidden')) cerrarModalCierre();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();