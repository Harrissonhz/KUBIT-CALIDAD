(function () {
  'use strict';

  var PRODUCTOS = [];
  var CLIENTES = [];
  var CARRITO = [];
  var TASA_IMPUESTO = 0.19;
  var CANALES = [];
  var METODOS_PAGO = [];
  var CANAL_ACTIVO = 'mercadolibre';
  var _loading = false;

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  async function init() {
    aplicarDarkMode();
    cargarSesionYMostrar();
    mostrarFecha();
    mostrarInfoCaja();
    await Promise.all([
      cargarProductos(),
      cargarClientes(),
      cargarCanales(),
      cargarMetodosPago(),
      cargarVendedores()
    ]);
    setClienteDefecto();
    setFechaDefecto();
    setearValoresDefecto();
    bindearEventos();
    actualizarTotales();
    window.KubitAuth.aplicarRestriccionesUI();
    validarFormulario();
  }

  function aplicarDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');
  }

  function toggleDark() {
    html.classList.toggle('dark');
    localStorage.setItem('darkMode', html.classList.contains('dark'));
  }

  function cargarSesionYMostrar() {
    window.KubitAuth.cargarSesion();
    var user = window.KubitAuth.obtenerUsuario();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
  }

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

  async function cargarProductos() {
    var res = await DB.productos.listarConDetalle();
    if (res.error) {
      console.error('[Ventas] Error cargando productos:', res.error);
      mostrarToast('Error al cargar productos');
      return;
    }
    PRODUCTOS = (res.data || []).map(function (d) {
      var p = d.producto || {};
      return {
        detalleId: d.id,
        productoId: p.id || d.producto_id,
        nombre: p.nombre || 'Sin nombre',
        codigoInterno: d.codigo_interno || '',
        precio: d.precio_venta || 0,
        precioCompra: d.precio_compra || 0,
        descuentoMax: d.descuento_max || 0,
        stock: d.stock_actual || 0,
        categoriaId: p.categoria_id || null,
        categoriaNombre: (p.categoria && p.categoria.nombre) || '',
        tags: p.tags || [],
        tasaImpuesto: p.tasa_impuesto !== null && p.tasa_impuesto !== undefined ? p.tasa_impuesto : TASA_IMPUESTO,
        slug: p.slug || ''
      };
    });
  }

  async function cargarClientes() {
    var res = await DB.clientes.listar({ limit: 100 });
    if (res.error) {
      console.error('[Ventas] Error cargando clientes:', res.error);
      return;
    }
    CLIENTES = res.data || [];
  }

  async function cargarCanales() {
    try {
      var data = await window.__supabase.get('pos_canales_venta?select=*&order=nombre.asc');
      CANALES = data || [];
    } catch (e) {
      console.error('[Ventas] Error cargando canales:', e);
    }
  }

  async function cargarMetodosPago() {
    var res = await DB.metodosPago.listar();
    if (res.error) {
      console.error('[Ventas] Error cargando metodos de pago:', res.error);
      return;
    }
    METODOS_PAGO = res.data || [];
  }

  async function cargarVendedores() {
    try {
      var data = await window.__supabase.get('pos_usuarios?select=id,nombre_completo,activo&activo=eq.true&order=nombre_completo.asc');
      var select = $('select-vendedor');
      var user = window.KubitAuth.obtenerUsuario();
      select.innerHTML = '';
      (data || []).forEach(function (u) {
        var sel = u.id === user.id ? ' selected' : '';
        select.innerHTML += '<option value="' + u.id + '"' + sel + '>' + u.nombre_completo + '</option>';
      });
    } catch (e) {
      console.error('[Ventas] Error cargando vendedores:', e);
    }
  }

  function setClienteDefecto() {
    var cliente = CLIENTES.find(function(c) { return c.numero_id === '222222222222'; });
    if (!cliente) return;
    var nombre = [cliente.primer_nombre, cliente.segundo_nombre, cliente.primer_apellido, cliente.segundo_apellido].filter(Boolean).join(' ');
    $('input-cliente').value = nombre;
    $('selected-cliente-id').value = cliente.id;
  }

  function setFechaDefecto() {
    var ahora = new Date();
    var y = ahora.getFullYear();
    var m = String(ahora.getMonth() + 1).padStart(2, '0');
    var d = String(ahora.getDate()).padStart(2, '0');
    var h = String(ahora.getHours()).padStart(2, '0');
    var min = String(ahora.getMinutes()).padStart(2, '0');
    $('input-fecha').value = y + '-' + m + '-' + d + 'T' + h + ':' + min;
  }

  function setearValoresDefecto() {
    $('select-metodo-pago').value = 'transferencia';
    toggleCostosCanal('mercadolibre');
  }

  function toggleCostosCanal(canal) {
    var costosSection = $('costos-canal-section');
    if (canal === 'mercadolibre') {
      costosSection.classList.remove('hidden');
    } else {
      costosSection.classList.add('hidden');
    }
  }

  /* ─── CLIENTE AUTOCOMPLETE ─── */
  var _clienteTimer = null;
  function onClienteInput() {
    clearTimeout(_clienteTimer);
    var q = $('input-cliente').value.trim();
    if (q.length < 2) {
      $('cliente-suggestions').classList.add('hidden');
      $('selected-cliente-id').value = '';
      return;
    }
    _clienteTimer = setTimeout(function () { buscarClientes(q); }, 250);
  }

  async function buscarClientes(q) {
    var res = await DB.clientes.buscar(q);
    var container = $('cliente-suggestions');
    if (res.error || !res.data || !res.data.length) {
      container.classList.add('hidden');
      return;
    }
    container.innerHTML = res.data.map(function (c) {
      var nombre = [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido].filter(Boolean).join(' ');
      var doc = c.numero_id || '';
      return '<div class="cliente-sugerencia px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center justify-between" data-id="' + c.id + '">' +
        '<span>' + escaparHTML(nombre) + '</span>' +
        (doc ? '<span class="text-xs text-slate-400">' + escaparHTML(doc) + '</span>' : '') +
        '</div>';
    }).join('');
    container.classList.remove('hidden');
  }

  function seleccionarCliente(e) {
    var item = e.target.closest('.cliente-sugerencia');
    if (!item) return;
    var id = item.dataset.id;
    var nombre = item.firstChild.textContent.trim();
    $('input-cliente').value = nombre;
    $('selected-cliente-id').value = id;
    $('cliente-suggestions').classList.add('hidden');
  }

  /* ─── PRODUCTO SEARCH ─── */
  var _productoTimer = null;
  function onProductoInput() {
    clearTimeout(_productoTimer);
    var q = $('input-buscar-producto').value.trim().toLowerCase();
    var container = $('producto-suggestions');
    if (q.length < 1) {
      container.classList.add('hidden');
      return;
    }
    _productoTimer = setTimeout(function () {
      var matches = PRODUCTOS.filter(function (p) {
        return p.nombre.toLowerCase().includes(q) || (p.codigoInterno && p.codigoInterno.toLowerCase().includes(q));
      }).slice(0, 8);

      if (!matches.length) {
        container.classList.add('hidden');
        return;
      }
      container.innerHTML = matches.map(function (p) {
        var agotado = p.stock <= 0;
        return '<div class="producto-sugerencia px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center justify-between ' + (agotado ? 'opacity-50' : '') + '" data-id="' + p.detalleId + '">' +
          '<div><span class="text-slate-700 dark:text-slate-300">' + escaparHTML(p.nombre) + '</span>' +
          (p.codigoInterno ? '<span class="text-xs text-slate-400 block">' + escaparHTML(p.codigoInterno) + '</span>' : '') + '</div>' +
          '<div class="text-right"><span class="text-slate-950 dark:text-white font-medium">' + formatearMoneda(p.precio) + '</span>' +
          '<span class="text-xs text-slate-400 ml-2">Stock: ' + p.stock + '</span></div>' +
          '</div>';
      }).join('');
      container.classList.remove('hidden');
    }, 200);
  }

  function seleccionarProducto(e) {
    var item = e.target.closest('.producto-sugerencia');
    if (!item) return;
    var detalleId = item.dataset.id;
    agregarAlCarrito(detalleId);
    $('input-buscar-producto').value = '';
    $('producto-suggestions').classList.add('hidden');
    $('input-buscar-producto').focus();
  }

  function agregarAlCarrito(detalleId) {
    var p = obtenerProducto(detalleId);
    if (!p) return;
    if (p.stock <= 0) {
      mostrarToast('Producto agotado');
      return;
    }
    var existente = CARRITO.find(function (i) { return i.detalleId === detalleId; });
    if (existente) {
      if (existente.cantidad >= p.stock) {
        mostrarToast('Stock insuficiente');
        return;
      }
      existente.cantidad += 1;
    } else {
      CARRITO.push({
        detalleId: p.detalleId,
        productoId: p.productoId,
        nombre: p.nombre,
        precio: p.precio,
        cantidad: 1,
        descuento: 0,
        descuentoMax: p.descuentoMax,
        precioCompra: p.precioCompra,
        stock: p.stock
      });
    }
    actualizarCarrito();
  }

  function obtenerProducto(detalleId) {
    return PRODUCTOS.find(function (x) { return x.detalleId === detalleId; });
  }

  function quitarDelCarrito(detalleId) {
    CARRITO = CARRITO.filter(function (i) { return i.detalleId !== detalleId; });
    actualizarCarrito();
  }

  function cambiarCantidad(detalleId, delta) {
    var item = CARRITO.find(function (i) { return i.detalleId === detalleId; });
    if (!item) return;
    var nueva = item.cantidad + delta;
    if (nueva < 1) { quitarDelCarrito(detalleId); return; }
    var p = obtenerProducto(detalleId);
    if (p && nueva > p.stock) {
      mostrarToast('Stock insuficiente');
      return;
    }
    item.cantidad = nueva;
    actualizarCarrito();
  }

  function cambiarDescuentoItem(detalleId, valor) {
    var item = CARRITO.find(function (i) { return i.detalleId === detalleId; });
    if (!item) return;
    var max = item.descuentoMax || 100;
    var user = window.KubitAuth.obtenerUsuario();
    if (!window.KubitAuth.tienePermiso('pos.descuento.alto')) {
      max = Math.min(max, 10);
    }
    var v = Math.min(Math.max(parseFloat(valor) || 0, 0), max);
    item.descuento = v;
    actualizarBadge();
    actualizarTotales();
    validarFormulario();
  }

  function cambiarPrecioItem(detalleId, valor) {
    var item = CARRITO.find(function (i) { return i.detalleId === detalleId; });
    if (!item) return;
    var v = Math.max(parseFloat(valor) || 0, 0);
    item.precio = v;
    actualizarBadge();
    actualizarTotales();
    validarFormulario();
  }

  function actualizarSubtotalRow(detalleId, inputEl) {
    var item = CARRITO.find(function (i) { return i.detalleId === detalleId; });
    if (!item) return;
    var row = inputEl.closest('tr');
    if (!row) return;
    var cell = row.querySelector('.cell-subtotal');
    if (!cell) return;
    var base = item.precio * item.cantidad;
    var desc = base * (item.descuento / 100);
    cell.textContent = formatearMoneda(base - desc);
  }

  function actualizarBadge() {
    var badge = $('cart-count-badge');
    if (badge) {
      var totalItems = CARRITO.reduce(function (s, i) { return s + i.cantidad; }, 0);
      badge.textContent = totalItems + ' items';
    }
  }

  function actualizarCarrito() {
    var tbody = $('cart-table-body');
    actualizarBadge();
    if (!CARRITO.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-slate-300 dark:text-slate-700">' +
        '<svg class="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>' +
        '<p class="text-sm">Carrito vacio</p><p class="text-xs mt-1">Busca y agrega productos a la venta</p></td></tr>';
    } else {
      tbody.innerHTML = CARRITO.map(function (i, index) {
        var base = i.precio * i.cantidad;
        var desc = base * (i.descuento / 100);
        var sub = base - desc;
        var maxD = i.descuentoMax || 100;
        return '<tr class="border-b border-slate-100 dark:border-slate-800 text-sm ' + (index % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/20') + '">' +
          '<td class="py-2.5 pr-2"><span class="text-slate-900 dark:text-slate-100 font-medium">' + escaparHTML(i.nombre) + '</span></td>' +
          '<td class="py-2.5 px-2 text-right"><input type="number" class="input-precio-item w-24 px-1.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white/20" value="' + i.precio + '" min="0" step="any" data-id="' + i.detalleId + '"></td>' +
          '<td class="py-2.5 px-2 text-center"><div class="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg"><button class="btn-cant-menos w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-950 dark:hover:text-white rounded-lg transition-colors" data-id="' + i.detalleId + '">-</button><span class="w-6 text-center text-sm font-medium text-slate-950 dark:text-white">' + i.cantidad + '</span><button class="btn-cant-mas w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-950 dark:hover:text-white rounded-lg transition-colors" data-id="' + i.detalleId + '">+</button></div></td>' +
          '<td class="py-2.5 px-2 text-center"><input type="number" class="input-dto-item w-14 px-1.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-950 dark:text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-slate-950 dark:focus:ring-white/20" value="' + i.descuento + '" min="0" max="' + maxD + '" step="0.5" data-id="' + i.detalleId + '"></td>' +
          '<td class="cell-subtotal py-2.5 px-2 text-right font-medium text-slate-950 dark:text-white">' + formatearMoneda(sub) + '</td>' +
          '<td class="py-2.5 pl-2 text-center"><button class="btn-eliminar-item w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors" data-id="' + i.detalleId + '"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg></button></td>' +
          '</tr>';
      }).join('');
    }
    actualizarTotales();
    validarFormulario();
  }

  function formatearMoneda(valor) {
    return '$' + Number(valor || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function escaparHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function actualizarStatsCarrito() {
    var count = CARRITO.length;
    var unidades = CARRITO.reduce(function (s, i) { return s + i.cantidad; }, 0);
    var subtotal = CARRITO.reduce(function (s, i) { return s + (i.precio * i.cantidad); }, 0);
    $('stats-productos').textContent = count;
    $('stats-unidades').textContent = unidades;
    $('stats-ticket-prom').textContent = count > 0 ? formatearMoneda(subtotal / count) : '$0';
  }

  function actualizarTotales() {
    actualizarStatsCarrito();
    var subtotal = CARRITO.reduce(function (s, i) {
      return s + (i.precio * i.cantidad);
    }, 0);

    var descGlobalPct = parseFloat($('input-descuento-global').value) || 0;
    var descGlobal = subtotal * (descGlobalPct / 100);

    var total = subtotal - descGlobal;

    var ivaTotal = CARRITO.reduce(function (s, i) {
      var base = i.precio * i.cantidad;
      var tasa = i.tasaImpuesto || 0;
      if (tasa > 0) {
        return s + (base - (base / (1 + tasa)));
      }
      return s;
    }, 0);

    // Determinar label del IVA segun tasas en el carrito
    var tasas = {};
    CARRITO.forEach(function (i) {
      tasas[i.tasaImpuesto || 0] = true;
    });
    var tasaKeys = Object.keys(tasas).map(Number).sort();
    var labelIva = 'IVA';
    if (tasaKeys.length === 1) {
      var pct = tasaKeys[0] * 100;
      var nombre = pct === 0 ? 'exento' : (pct === 5 ? 'reducido' : 'general');
      labelIva += ' (' + pct + '% ' + nombre + ')';
    } else if (tasaKeys.length > 1) {
      labelIva += ' (tasas mixtas)';
    }
    $('label-impuesto').textContent = labelIva;

    var cargoVenta = parseFloat($('input-costo-cargo').value) || 0;
    var cargoImpuestos = parseFloat($('input-costo-impuestos').value) || 0;
    var cargoEnvios = parseFloat($('input-costo-envios').value) || 0;
    var totalCostos = cargoVenta + cargoImpuestos + cargoEnvios;

    var ingresoNeto = total - totalCostos;

    $('res-subtotal').textContent = formatearMoneda(subtotal);
    $('res-descuento').textContent = formatearMoneda(descGlobal);
    $('res-impuesto').textContent = formatearMoneda(ivaTotal);
    $('res-total-costos').textContent = formatearMoneda(totalCostos);
    $('res-total').textContent = formatearMoneda(total);

    var netoSection = $('res-ingreso-neto-section');
    if (CANAL_ACTIVO === 'mercadolibre') {
      netoSection.classList.remove('hidden');
      $('res-ingreso-neto').textContent = formatearMoneda(ingresoNeto);
    } else {
      netoSection.classList.add('hidden');
    }
  }

  function validarFormulario() {
    var btn = $('btn-procesar');
    btn.disabled = CARRITO.length === 0;
  }

  function limpiarFormulario() {
    CARRITO = [];
    $('input-cliente').value = '';
    $('selected-cliente-id').value = '';
    $('input-referencia').value = '';
    $('input-descuento-global').value = '0';
    $('input-costo-cargo').value = '0';
    $('input-costo-impuestos').value = '0';
    $('input-costo-envios').value = '0';
    $('input-buscar-producto').value = '';
    $('producto-suggestions').classList.add('hidden');
    setFechaDefecto();
    setearValoresDefecto();
    actualizarCarrito();
    actualizarTotales();
    mostrarToast('Formulario limpiado');
  }

  async function procesarVenta() {
    if (_loading) return;
    _loading = true;
    var btn = $('btn-procesar');
    btn.disabled = true;
    btn.innerHTML = '<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"/></svg> Procesando...';

    try {
      var erroresStock = validarStockCarrito();
      if (erroresStock.length) {
        mostrarToast('Stock insuficiente: ' + erroresStock.join(' | '));
        _loading = false;
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Procesar Venta';
        return;
      }

      var user = window.KubitAuth.obtenerUsuario();
      var canalSeleccionado = document.querySelector('input[name="canal"]:checked');
      var canalCodigo = canalSeleccionado ? canalSeleccionado.value : 'mercadolibre';
      var canal = CANALES.find(function (c) { return c.codigo === canalCodigo; });
      var canalId = canal ? canal.id : null;

      var vendedorId = $('select-vendedor').value || user.id;
      var clienteId = $('selected-cliente-id').value || null;
      var metodoPago = $('select-metodo-pago').value;
      var referencia = $('input-referencia').value.trim() || null;
      var fechaVenta = $('input-fecha').value;
      var fechaISO = fechaVenta ? new Date(fechaVenta).toISOString() : new Date().toISOString();

      var t = calcularTotalesDesdeFormulario();

      var numeroVenta = await window.__supabase.rpc('generar_consecutivo', { p_entidad: 'VENTA', p_prefijo: 'KBT' });
      var ventaData = {
        numero_venta: numeroVenta,
        cliente_id: clienteId,
        usuario_id: vendedorId,
        canal_id: canalId,
        fecha_venta: fechaISO,
        metodo_pago: metodoPago,
        estado: 'CONFIRMADA',
        referencia_externa: referencia,
        subtotal: t.baseSinIva,
        descuento: t.descuento,
        impuesto: t.impuesto,
        total: t.total,
        costo_cargo_venta: CANAL_ACTIVO === 'mercadolibre' ? t.cargoVenta : 0,
        costo_impuestos: CANAL_ACTIVO === 'mercadolibre' ? t.cargoImpuestos : 0,
        costo_envios: CANAL_ACTIVO === 'mercadolibre' ? t.cargoEnvios : 0
      };

      var detalles = CARRITO.map(function (i) {
        var base = i.precio * i.cantidad;
        var desc = base * (i.descuento / 100);
        var subConDesc = base - desc;
        var tasa = i.tasaImpuesto || 0;
        var baseSinIva = tasa > 0 ? (subConDesc / (1 + tasa)) : subConDesc;
        var imp = subConDesc - baseSinIva;
        return {
          producto_detalle_id: i.detalleId,
          cantidad: i.cantidad,
          precio_unitario: i.precio,
          descuento: desc,
          tasa_impuesto: tasa,
          subtotal: baseSinIva,
          impuesto: imp,
          total: subConDesc
        };
      });

      var res = await DB.ventas.crearConDetalles(ventaData, detalles);
      if (res.error) {
        mostrarToast('Error al guardar venta: ' + res.error);
        _loading = false;
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Procesar Venta';
        return;
      }

      var ventaId = res.data.id;

      for (var j = 0; j < CARRITO.length; j++) {
        var item = CARRITO[j];
        await DB.productos.ajustarStock(
          item.detalleId,
          -item.cantidad,
          'salida',
          'Venta #' + ventaData.numero_venta,
          { usuarioId: user.id }
        );
      }

      var fd = new Date(fechaVenta);
      var anio = fd.getFullYear();
      var mes = fd.getMonth() + 1;

      await DB.finanzasMensuales.actualizarPorVenta(
        anio,
        mes,
        t.total,
        t.descuento,
        CANAL_ACTIVO === 'mercadolibre' ? (t.cargoVenta + t.cargoImpuestos + t.cargoEnvios) : 0,
        CARRITO.reduce(function (s, i) { return s + (i.precioCompra || 0) * i.cantidad; }, 0)
      );

      var metodoNombre = $('select-metodo-pago').options[$('select-metodo-pago').selectedIndex].text;
      var resumen = formatearMoneda(t.total) + ' · ' + metodoNombre + ' · ' + CARRITO.reduce(function (s, i) { return s + i.cantidad; }, 0) + ' items';
      $('exito-resumen').textContent = resumen;
      $('modal-exito').classList.remove('hidden');
    } catch (e) {
      console.error('[Ventas] Error en procesarVenta:', e);
      mostrarToast('Error inesperado al procesar la venta');
    }

    _loading = false;
    btn.disabled = false;
    btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> Procesar Venta';
  }

  function calcularTotalesDesdeFormulario() {
    var subtotal = CARRITO.reduce(function (s, i) {
      return s + (i.precio * i.cantidad);
    }, 0);
    var descGlobalPct = parseFloat($('input-descuento-global').value) || 0;
    var descuento = subtotal * (descGlobalPct / 100);
    var total = subtotal - descuento;

    var ivaTotal = CARRITO.reduce(function (s, i) {
      var base = i.precio * i.cantidad;
      var tasa = i.tasaImpuesto || 0;
      if (tasa > 0) {
        return s + (base - (base / (1 + tasa)));
      }
      return s;
    }, 0);

    var baseSinIva = CARRITO.reduce(function (s, i) {
      var base = i.precio * i.cantidad;
      var tasa = i.tasaImpuesto || 0;
      if (tasa > 0) {
        return s + (base / (1 + tasa));
      }
      return s + base;
    }, 0);

    var cargoVenta = parseFloat($('input-costo-cargo').value) || 0;
    var cargoImpuestos = parseFloat($('input-costo-impuestos').value) || 0;
    var cargoEnvios = parseFloat($('input-costo-envios').value) || 0;
    return {
      subtotal: subtotal,
      baseSinIva: baseSinIva,
      descuento: descuento,
      impuesto: ivaTotal,
      total: total,
      cargoVenta: cargoVenta,
      cargoImpuestos: cargoImpuestos,
      cargoEnvios: cargoEnvios
    };
  }

  function validarStockCarrito() {
    var errores = [];
    CARRITO.forEach(function (item) {
      var p = obtenerProducto(item.detalleId);
      if (p && item.cantidad > p.stock) {
        errores.push(item.nombre + ': solicitado ' + item.cantidad + ', disponible ' + p.stock);
      }
    });
    return errores;
  }

  function cerrarExito() {
    $('modal-exito').classList.add('hidden');
  }

  function nuevaVenta() {
    limpiarFormulario();
    cerrarExito();
    mostrarToast('Listo para nueva venta');
  }

  function mostrarToast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

  function bindearEventos() {
    $('btn-dark').addEventListener('click', toggleDark);

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

    document.querySelectorAll('input[name="canal"]').forEach(function (r) {
      r.addEventListener('change', function () {
        CANAL_ACTIVO = this.value;
        document.querySelectorAll('.canal-option').forEach(function (l) {
          var input = l.querySelector('input');
          if (input && input.checked) {
            l.className = 'canal-option active cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-950 dark:border-white bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-sm font-medium transition-all';
          } else {
            l.className = 'canal-option cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:border-slate-300 dark:hover:border-slate-600 transition-all';
          }
        });
        toggleCostosCanal(CANAL_ACTIVO);
        if (CANAL_ACTIVO === 'mercadolibre') {
          $('select-metodo-pago').value = 'transferencia';
        }
        actualizarTotales();
      });
    });

    $('input-cliente').addEventListener('input', onClienteInput);
    $('cliente-suggestions').addEventListener('click', seleccionarCliente);
    $('input-cliente').addEventListener('blur', function () {
      setTimeout(function () { $('cliente-suggestions').classList.add('hidden'); }, 200);
    });

    $('input-buscar-producto').addEventListener('input', onProductoInput);
    $('producto-suggestions').addEventListener('click', seleccionarProducto);
    $('input-buscar-producto').addEventListener('blur', function () {
      setTimeout(function () { $('producto-suggestions').classList.add('hidden'); }, 200);
    });

    $('btn-agregar-producto').addEventListener('click', function () {
      var q = $('input-buscar-producto').value.trim().toLowerCase();
      if (!q) return;
      var match = PRODUCTOS.find(function (p) {
        return p.nombre.toLowerCase().includes(q) || (p.codigoInterno && p.codigoInterno.toLowerCase().includes(q));
      });
      if (match) {
        agregarAlCarrito(match.detalleId);
        $('input-buscar-producto').value = '';
        $('producto-suggestions').classList.add('hidden');
        $('input-buscar-producto').focus();
      } else {
        mostrarToast('Producto no encontrado');
      }
    });

    document.addEventListener('click', function (e) {
      var btnMenos = e.target.closest('.btn-cant-menos');
      if (btnMenos) { cambiarCantidad(btnMenos.dataset.id, -1); return; }
      var btnMas = e.target.closest('.btn-cant-mas');
      if (btnMas) { cambiarCantidad(btnMas.dataset.id, 1); return; }
      var btnEliminar = e.target.closest('.btn-eliminar-item');
      if (btnEliminar) { quitarDelCarrito(btnEliminar.dataset.id); return; }
    });

    $('cart-table-body').addEventListener('input', function (e) {
      var dtoInput = e.target.closest('.input-dto-item');
      if (dtoInput) {
        cambiarDescuentoItem(dtoInput.dataset.id, dtoInput.value);
        actualizarSubtotalRow(dtoInput.dataset.id, dtoInput);
        return;
      }
      var precioInput = e.target.closest('.input-precio-item');
      if (precioInput) {
        cambiarPrecioItem(precioInput.dataset.id, precioInput.value);
        actualizarSubtotalRow(precioInput.dataset.id, precioInput);
      }
    });

    $('input-descuento-global').addEventListener('input', actualizarTotales);

    ['input-costo-cargo', 'input-costo-impuestos', 'input-costo-envios'].forEach(function (id) {
      $(id).addEventListener('input', actualizarTotales);
    });

    $('btn-procesar').addEventListener('click', procesarVenta);
    $('btn-limpiar').addEventListener('click', limpiarFormulario);
    $('btn-cerrar-exito').addEventListener('click', cerrarExito);
    $('btn-nueva-venta').addEventListener('click', nuevaVenta);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
