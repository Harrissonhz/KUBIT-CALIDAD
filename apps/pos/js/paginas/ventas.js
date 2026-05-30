(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     PRODUCTOS MOCK (simula datos de Supabase)
     descuento_max → pos_productos_detalle.descuento_max (%)
     precio_compra → pos_productos_detalle.precio_compra (para margen)
     ════════════════════════════════════════════════════════════ */
  var PRODUCTOS = [
    { id: 'p1', nombre: 'Zapatillas Nike Air',      precio: 89990,  precio_compra: 55000, descuento_max: 15, categoria: 'zapatos',    icono: '👟', stock: 15 },
    { id: 'p2', nombre: 'Camiseta Polo Classic',     precio: 45000,  precio_compra: 28000, descuento_max: 20, categoria: 'ropa',      icono: '👕', stock: 23 },
    { id: 'p3', nombre: 'Gorra New Era 59Fifty',     precio: 35000,  precio_compra: 22000, descuento_max: 10, categoria: 'accesorios', icono: '🧢', stock: 8 },
    { id: 'p4', nombre: 'Zapatillas Adidas Run',     precio: 79990,  precio_compra: 50000, descuento_max: 15, categoria: 'zapatos',    icono: '👟', stock: 12 },
    { id: 'p5', nombre: 'Camiseta Under Armour',     precio: 55000,  precio_compra: 32000, descuento_max: 20, categoria: 'ropa',      icono: '👕', stock: 20 },
    { id: 'p6', nombre: 'Jordan Retro 4',            precio: 120000, precio_compra: 80000, descuento_max: 5,  categoria: 'zapatos',    icono: '👟', stock: 5 },
    { id: 'p7', nombre: 'Reloj Casio G-Shock',       precio: 65000,  precio_compra: 40000, descuento_max: 10, categoria: 'accesorios', icono: '⌚', stock: 10 },
    { id: 'p8', nombre: 'Chaqueta Nike Windrunner',  precio: 135000, precio_compra: 85000, descuento_max: 15, categoria: 'ropa',      icono: '🧥', stock: 7 },
    { id: 'p9', nombre: 'Bolso Deportivo Nike',      precio: 42000,  precio_compra: 26000, descuento_max: 10, categoria: 'accesorios', icono: '🎒', stock: 11 },
    { id: 'p10', nombre: 'Zapatillas Puma Smash',    precio: 69990,  precio_compra: 42000, descuento_max: 15, categoria: 'zapatos',    icono: '👟', stock: 18 },
    { id: 'p11', nombre: 'Camiseta Selección Colombia', precio: 49000, precio_compra: 30000, descuento_max: 10, categoria: 'ropa',    icono: '👕', stock: 14 },
    { id: 'p12', nombre: 'Medias Nike Dri-FIT',      precio: 15000,  precio_compra: 8000,  descuento_max: 30, categoria: 'ropa',      icono: '🧦', stock: 0 },
  ];

  var TASA_IMPUESTO = 0.19;
  var PRODUCTOS_FILTRADOS = PRODUCTOS.slice();
  var CARRITO = [];
  var CATEGORIA_ACTIVA = 'todas';

  /* ════════════════════════════════════════════════════════════
     DOM REFS
     ════════════════════════════════════════════════════════════ */
  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  /* ════════════════════════════════════════════════════════════
     INICIALIZACIÓN
     ════════════════════════════════════════════════════════════ */
  function init() {
    aplicarDarkMode();
    cargarSesionYMostrar();
    mostrarFecha();
    mostrarInfoCaja();
    renderizarProductos(PRODUCTOS);
    bindearEventos();
    window.KubitAuth.aplicarRestriccionesUI();
  }

  /* ════════════════════════════════════════════════════════════
     SESIÓN
     ════════════════════════════════════════════════════════════ */
  function cargarSesionYMostrar() {
    window.KubitAuth.cargarSesion();
    var user = window.KubitAuth.obtenerUsuario();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
  }

  /* ════════════════════════════════════════════════════════════
     DARK MODE
     ════════════════════════════════════════════════════════════ */
  function aplicarDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');
  }

  function toggleDark() {
    html.classList.toggle('dark');
    localStorage.setItem('darkMode', html.classList.contains('dark'));
  }

  /* ════════════════════════════════════════════════════════════
     INFO DE CABECERA
     ════════════════════════════════════════════════════════════ */
  function mostrarFecha() {
    var ahora = new Date();
    var opts = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    $('fecha-actual').textContent = ahora.toLocaleDateString('es-CO', opts);
    setInterval(function () {
      var a = new Date();
      $('fecha-actual').textContent = a.toLocaleDateString('es-CO', opts);
    }, 30000);
  }

  function mostrarInfoCaja() {
    var cajaNombre = localStorage.getItem('pos_caja_nombre') || 'Caja Principal';
    var user = window.KubitAuth.obtenerUsuario();
    var nombre = user ? user.nombre : 'Admin';
    var rol = user ? user.rolNombre : '';
    $('caja-info').textContent = cajaNombre + ' · Abierta';
    $('user-name').textContent = nombre;
    $('user-rol').textContent = rol;
    $('user-avatar').textContent = nombre.charAt(0).toUpperCase();
  }

  /* ════════════════════════════════════════════════════════════
     PRODUCTOS — con margen de ganancia en tooltip (§5.2)
     ════════════════════════════════════════════════════════════ */
  function renderizarProductos(lista) {
    var grid = $('productos-grid');
    if (!lista.length) {
      grid.innerHTML = '<div class="col-span-full flex items-center justify-center h-40 text-slate-400 dark:text-slate-600 text-sm">Ningún producto coincide con la búsqueda</div>';
      return;
    }
    grid.innerHTML = lista.map(function (p, i) {
      var margen = p.precio_compra > 0 ? Math.round((p.precio - p.precio_compra) / p.precio_compra * 100) : 0;
      var agotado = p.stock <= 0;
      return '<div class="producto-card relative bg-white dark:bg-slate-900 border ' + (agotado ? 'border-red-200 dark:border-red-900/50 opacity-60' : 'border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700') + ' rounded-xl p-3 flex flex-col items-center text-center shadow-sm" data-id="' + p.id + '" style="animation-delay:' + (i * 0.03) + 's" title="Costo: ' + formatearMoneda(p.precio_compra) + ' · Margen: ' + margen + '%">' +
        (agotado ? '<span class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">Agotado</span>' : '') +
        '<span class="text-3xl mb-2">' + p.icono + '</span>' +
        '<p class="text-xs font-medium text-slate-950 dark:text-white leading-tight line-clamp-2">' + p.nombre + '</p>' +
        '<p class="text-sm font-semibold text-slate-950 dark:text-white mt-1 precio">' + formatearMoneda(p.precio) + '</p>' +
        '<span class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">' + (agotado ? 'Sin stock' : 'Stock: ' + p.stock) + '</span>' +
        '<span class="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">Margen ' + margen + '%</span>' +
        '</div>';
    }).join('');
  }

  function filtrarProductos() {
    var q = $('buscador').value.toLowerCase().trim();
    PRODUCTOS_FILTRADOS = PRODUCTOS.filter(function (p) {
      var matchCategoria = CATEGORIA_ACTIVA === 'todas' || p.categoria === CATEGORIA_ACTIVA;
      var matchBusqueda = !q || p.nombre.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      return matchCategoria && matchBusqueda;
    });
    renderizarProductos(PRODUCTOS_FILTRADOS);
  }

  /* ════════════════════════════════════════════════════════════
     CARRITO — con descuento por ítem (§3.1.2.2)
     ════════════════════════════════════════════════════════════ */
  function obtenerProducto(pId) {
    return PRODUCTOS.find(function (x) { return x.id === pId; });
  }

  function agregarAlCarrito(pId) {
    var p = obtenerProducto(pId);
    if (!p) return;
    if (p.stock <= 0) {
      mostrarToast('Producto agotado');
      return;
    }
    var existente = CARRITO.find(function (i) { return i.id === pId; });
    if (existente) {
      if (existente.cantidad >= p.stock) {
        mostrarToast('Stock insuficiente');
        return;
      }
      existente.cantidad += 1;
    } else {
      CARRITO.push({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        icono: p.icono,
        cantidad: 1,
        descuento: 0,
        descuentoMax: p.descuento_max,
        precioCompra: p.precio_compra,
        stock: p.stock,
      });
    }
    actualizarCarrito();
  }

  function quitarDelCarrito(pId) {
    var idx = CARRITO.findIndex(function (i) { return i.id === pId; });
    if (idx > -1) {
      if (CARRITO[idx].cantidad > 1) {
        CARRITO[idx].cantidad -= 1;
      } else {
        CARRITO.splice(idx, 1);
      }
    }
    actualizarCarrito();
  }

  function limpiarCarrito() {
    CARRITO = [];
    actualizarCarrito();
    mostrarToast('Carrito limpiado');
  }

  function actualizarDescuento(pId, valor) {
    var item = CARRITO.find(function (i) { return i.id === pId; });
    if (!item) return;
    var desc = Math.max(0, Math.min(100, parseFloat(valor) || 0));
    var user = window.KubitAuth.obtenerUsuario();
    var puedeAltoDescuento = window.KubitAuth.tienePermiso('pos.descuento.alto');
    if (!puedeAltoDescuento && desc > item.descuentoMax) {
      desc = item.descuentoMax;
      mostrarToast('Descuento máximo: ' + item.descuentoMax + '%');
    }
    item.descuento = desc;
    actualizarCarrito();
  }

  function calcularTotales() {
    var subtotal = 0;
    var descuentoTotal = 0;
    CARRITO.forEach(function (i) {
      var base = i.precio * i.cantidad;
      subtotal += base;
      descuentoTotal += base * (i.descuento / 100);
    });
    var subtotalConDescuento = subtotal - descuentoTotal;
    var impuesto = subtotalConDescuento * TASA_IMPUESTO;
    var total = subtotalConDescuento + impuesto;
    return { subtotal: subtotal, descuento: descuentoTotal, impuesto: impuesto, total: Math.max(0, total) };
  }

  function formatearMoneda(valor) {
    return '$' + valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ════════════════════════════════════════════════════════════
     RENDER CART ITEMS — con input de descuento (§3.1.2.2)
     ════════════════════════════════════════════════════════════ */
  function renderCartItems(contenedor, esSheet) {
    if (!CARRITO.length) {
      contenedor.innerHTML = '<div class="flex items-center justify-center h-32 text-slate-300 dark:text-slate-700"><p class="text-sm">Carrito vacío</p></div>';
      return;
    }
    contenedor.innerHTML = CARRITO.map(function (i) {
      var descPct = i.descuento || 0;
      var totalItem = i.precio * i.cantidad;
      var descItem = totalItem * (descPct / 100);
      return '<div class="cart-item flex flex-col gap-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">' +
        '<div class="flex items-center gap-3">' +
        '<span class="text-xl shrink-0">' + i.icono + '</span>' +
        '<div class="flex-1 min-w-0">' +
        '<p class="text-xs font-medium text-slate-950 dark:text-white truncate">' + i.nombre + '</p>' +
        '<p class="text-xs text-slate-400">' + formatearMoneda(i.precio) + ' c/u</p>' +
        '</div>' +
        '<div class="flex items-center gap-2 shrink-0">' +
        '<button class="btn-qty-minus w-7 h-7 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-medium" data-id="' + i.id + '">−</button>' +
        '<span class="text-sm font-medium text-slate-950 dark:text-white w-5 text-center venta-badge">' + i.cantidad + '</span>' +
        '<button class="btn-qty-plus w-7 h-7 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-medium" data-id="' + i.id + '">+</button>' +
        '</div>' +
        '<div class="text-right shrink-0">' +
        '<p class="text-sm font-semibold text-slate-950 dark:text-white">' + formatearMoneda(totalItem - descItem) + '</p>' +
        (descPct > 0 ? '<p class="text-[10px] text-emerald-600 dark:text-emerald-400">-' + descPct + '%</p>' : '') +
        '</div>' +
        '</div>' +
        '<div class="flex items-center gap-2 pl-11">' +
        '<label class="text-[10px] text-slate-400">Dto %</label>' +
        '<input class="input-descuento w-16 px-2 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs text-slate-950 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white/20" type="number" min="0" max="100" step="1" value="' + descPct + '" data-id="' + i.id + '">' +
        '<span class="text-[10px] text-slate-400">máx ' + i.descuentoMax + '%</span>' +
        '</div>' +
        '</div>';
    }).join('');

    contenedor.querySelectorAll('.btn-qty-minus').forEach(function (btn) {
      btn.addEventListener('click', function () { quitarDelCarrito(btn.dataset.id); });
    });
    contenedor.querySelectorAll('.btn-qty-plus').forEach(function (btn) {
      btn.addEventListener('click', function () { agregarAlCarrito(btn.dataset.id); });
    });
    contenedor.querySelectorAll('.input-descuento').forEach(function (inp) {
      inp.addEventListener('change', function () {
        actualizarDescuento(inp.dataset.id, inp.value);
        inp.value = CARRITO.find(function (i) { return i.id === inp.dataset.id; }).descuento;
      });
    });
  }

  function actualizarCarrito() {
    var t = calcularTotales();
    var empty = !CARRITO.length;

    // Desktop panel
    renderCartItems($('cart-items'), false);
    $('subtotal').textContent = formatearMoneda(t.subtotal);
    $('impuesto').textContent = formatearMoneda(t.impuesto);
    $('descuento').textContent = '-' + formatearMoneda(t.descuento);
    $('total').textContent = formatearMoneda(t.total);

    $('btn-cobrar').disabled = empty;
    $('btn-cobrar-mobile').disabled = empty;

    // Mobile bar
    var count = CARRITO.reduce(function (s, i) { return s + i.cantidad; }, 0);
    $('cart-count-mobile').textContent = count;
    $('cart-total-mobile').textContent = t.total.toLocaleString('es-CO', { minimumFractionDigits: 2 });

    // Bottom sheet
    renderCartItems($('sheet-items'), true);
    $('sheet-subtotal').textContent = formatearMoneda(t.subtotal);
    $('sheet-impuesto').textContent = formatearMoneda(t.impuesto);
    $('sheet-total').textContent = formatearMoneda(t.total);
    $('btn-sheet-cobrar').disabled = empty;
  }

  /* ════════════════════════════════════════════════════════════
     BOTTOM SHEET (Mobile)
     ════════════════════════════════════════════════════════════ */
  function abrirSheet() {
    if (!CARRITO.length) return;
    $('cart-bottom-sheet').classList.add('open');
  }

  function cerrarSheet() {
    $('cart-bottom-sheet').classList.remove('open');
  }

  /* ════════════════════════════════════════════════════════════
     MODAL DE COBRO — con validación de stock (§3.1.2.6)
     ════════════════════════════════════════════════════════════ */
  function abrirModalCobro() {
    if (!CARRITO.length) return;
    var t = calcularTotales();
    $('modal-total').textContent = formatearMoneda(t.total);
    $('btn-monto').textContent = formatearMoneda(t.total);
    $('monto-recibido').value = '';
    $('cambio-texto').classList.add('hidden');
    $('modal-cobro').classList.remove('hidden');
    cerrarSheet();
    setTimeout(function () { $('monto-recibido').focus(); }, 100);
  }

  function cerrarModalCobro() {
    $('modal-cobro').classList.add('hidden');
  }

  function validarStockCarrito() {
    var errores = [];
    CARRITO.forEach(function (item) {
      var p = obtenerProducto(item.id);
      if (p && item.cantidad > p.stock) {
        errores.push(item.nombre + ': solicitado ' + item.cantidad + ', disponible ' + p.stock);
      }
    });
    return errores;
  }

  function confirmarCobro() {
    // Validar stock (§3.1.2.6)
    var erroresStock = validarStockCarrito();
    if (erroresStock.length) {
      mostrarToast('Stock insuficiente: ' + erroresStock.join(' | '));
      return;
    }

    var metodo = document.querySelector('input[name="metodo"]:checked');
    if (!metodo) return;

    var t = calcularTotales();
    var total = t.total;
    var recibido = parseFloat($('monto-recibido').value) || 0;

    if (metodo.value === 'efectivo' && recibido < total) {
      mostrarToast('El monto recibido debe cubrir el total');
      return;
    }

    // Descontar stock real (simulado)
    CARRITO.forEach(function (item) {
      var p = obtenerProducto(item.id);
      if (p) p.stock -= item.cantidad;
    });

    // Mostrar modal de éxito con opción de factura (§4.1)
    var resumen = formatearMoneda(total) + ' · ' + metodo.value + ' · ' + CARRITO.length + ' ítems';
    $('exito-resumen').textContent = resumen;
    $('modal-exito').classList.remove('hidden');
    cerrarModalCobro();
  }

  /* ════════════════════════════════════════════════════════════
     MODAL DE ÉXITO (post-cobro)
     ════════════════════════════════════════════════════════════ */
  function cerrarExito() {
    $('modal-exito').classList.add('hidden');
  }

  function nuevaVenta() {
    CARRITO = [];
    actualizarCarrito();
    renderizarProductos(PRODUCTOS_FILTRADOS);
    cerrarExito();
    mostrarToast('Listo para nueva venta');
  }

  function emitirFactura() {
    cerrarExito();
    mostrarToast('Factura electrónica emitida (simulado)');
    CARRITO = [];
    actualizarCarrito();
    renderizarProductos(PRODUCTOS_FILTRADOS);
  }

  /* ════════════════════════════════════════════════════════════
     TOAST
     ════════════════════════════════════════════════════════════ */
  function mostrarToast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

  /* ════════════════════════════════════════════════════════════
     EVENTOS
     ════════════════════════════════════════════════════════════ */
  function bindearEventos() {
    $('btn-dark').addEventListener('click', toggleDark);

    // Sidebar
    $('btn-menu').addEventListener('click', function () {
      $('sidebar').classList.remove('-translate-x-full');
      $('sidebar-overlay').classList.remove('hidden');
    });
    function cerrarSidebar() {
      $('sidebar').classList.add('-translate-x-full');
      $('sidebar-overlay').classList.add('hidden');
    }
    $('btn-cerrar-menu').addEventListener('click', cerrarSidebar);
    $('sidebar-overlay').addEventListener('click', cerrarSidebar);

    // Búsqueda y categorías
    $('buscador').addEventListener('input', filtrarProductos);
    document.querySelectorAll('.categoria-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.categoria-pill').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        CATEGORIA_ACTIVA = btn.dataset.cat;
        filtrarProductos();
      });
    });

    // Click en producto para agregar al carrito
    document.addEventListener('click', function (e) {
      var card = e.target.closest('.producto-card');
      if (card) agregarAlCarrito(card.dataset.id);
    });

    // Limpiar carrito
    $('btn-limpiar').addEventListener('click', limpiarCarrito);
    $('btn-sheet-limpiar').addEventListener('click', function () {
      limpiarCarrito();
      cerrarSheet();
    });

    // Mobile: abrir bottom sheet
    $('cart-mobile-bar').addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      abrirSheet();
    });

    $('btn-cerrar-sheet').addEventListener('click', cerrarSheet);

    // Cobrar
    $('btn-cobrar').addEventListener('click', abrirModalCobro);
    $('btn-cobrar-mobile').addEventListener('click', abrirModalCobro);
    $('btn-sheet-cobrar').addEventListener('click', function () {
      cerrarSheet();
      setTimeout(abrirModalCobro, 300);
    });

    // Modal cobro
    $('btn-cerrar-modal').addEventListener('click', cerrarModalCobro);
    $('modal-cobro').addEventListener('click', function (e) {
      if (e.target === $('modal-cobro')) cerrarModalCobro();
    });
    $('btn-confirmar-cobro').addEventListener('click', confirmarCobro);

    // Modal éxito
    $('btn-cerrar-exito').addEventListener('click', cerrarExito);
    $('modal-exito').addEventListener('click', function (e) {
      if (e.target === $('modal-exito')) cerrarExito();
    });
    $('btn-nueva-venta').addEventListener('click', nuevaVenta);
    $('btn-factura').addEventListener('click', emitirFactura);

    // Métodos de pago
    document.querySelectorAll('.metodo-pago-option').forEach(function (label) {
      label.addEventListener('click', function () {
        document.querySelectorAll('.metodo-pago-option').forEach(function (l) { l.classList.remove('active'); });
        label.classList.add('active');
        var radio = label.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        var campoRecibido = $('campo-recibido');
        if (radio && radio.value === 'efectivo') {
          campoRecibido.classList.remove('hidden');
        } else {
          campoRecibido.classList.add('hidden');
        }
      });
    });

    // Cálculo de cambio
    $('monto-recibido').addEventListener('input', function () {
      var t = calcularTotales().total;
      var recibido = parseFloat(this.value) || 0;
      var cambio = recibido - t;
      if (recibido >= t) {
        $('cambio-texto').classList.remove('hidden');
        $('cambio-monto').textContent = formatearMoneda(cambio);
      } else {
        $('cambio-texto').classList.add('hidden');
      }
    });

    // Tecla Enter
    $('buscador').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && PRODUCTOS_FILTRADOS.length) {
        agregarAlCarrito(PRODUCTOS_FILTRADOS[0].id);
      }
    });
    $('monto-recibido').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') confirmarCobro();
    });

    // Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!$('modal-cobro').classList.contains('hidden')) cerrarModalCobro();
        else if (!$('modal-exito').classList.contains('hidden')) cerrarExito();
        else if ($('cart-bottom-sheet').classList.contains('open')) cerrarSheet();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();