(function () {
  'use strict';

  var PRODUCTOS = [];
  var CATEGORIAS = [];
  var EDITANDO_ID = null;
  var _guardando = false;

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  async function init() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');
    window.KubitAuth.cargarSesion();
    if (!window.KubitAuth.obtenerUsuario()) { window.location.href = 'login.html'; return; }
    window.KubitAuth.aplicarRestriccionesUI();

    await cargarCategorias();
    await cargarProductos();
    bindearEventos();
  }

  async function cargarCategorias() {
    var res = await DB.categorias.listarTodas();
    if (res.error) { console.error('[Productos] Error categorias:', res.error); return; }
    CATEGORIAS = res.data || [];

    [ $('campo-categoria'), $('filtro-categoria') ].forEach(function (sel) {
      sel.innerHTML = '<option value="">' + (sel.id === 'filtro-categoria' ? 'Todas' : 'Seleccionar...') + '</option>';
      CATEGORIAS.forEach(function (c) {
        sel.innerHTML += '<option value="' + c.id + '">' + c.nombre + '</option>';
      });
    });
  }

  async function cargarProductos() {
    $('productos-tbody').innerHTML = '<tr><td colspan="6" class="text-center py-8 text-slate-400">Cargando...</td></tr>';
    var res = await DB.productos.listarConDetalle();
    if (res.error) { console.error('[Productos] Error:', res.error); return; }
    PRODUCTOS = (res.data || []).map(function (d) {
      var p = d.producto || {};
      return {
        detalleId: d.id,
        productoId: p.id || d.producto_id,
        nombre: p.nombre || 'Sin nombre',
        categoriaId: p.categoria_id || null,
        categoriaNombre: (p.categoria && p.categoria.nombre) || '',
        codigoInterno: d.codigo_interno || '',
        codigoBarras: d.codigo_barras || '',
        marca: p.marca || '',
        modelo: p.modelo || '',
        descripcion: p.descripcion || '',
        precio: d.precio_venta || 0,
        precioCompra: d.precio_compra || 0,
        descuentoMax: d.descuento_max || 0,
        stock: d.stock_actual || 0,
        stockMin: d.stock_min || 0,
        stockMax: d.stock_max || 0,
        activo: p.activo !== false,
        tags: p.tags || [],
        tasaImpuesto: p.tasa_impuesto || 0.19,
        precioMayorista: d.precio_mayorista || 0,
        margen: d.margen_ganancia || 0
      };
    });
    renderizarTabla(PRODUCTOS);
  }

  function renderizarTabla(lista) {
    var tbody = $('productos-tbody');
    if (!lista.length) {
      tbody.innerHTML = '';
      $('productos-empty').classList.remove('hidden');
      return;
    }
    $('productos-empty').classList.add('hidden');
    tbody.innerHTML = lista.map(function (p) {
      var agotado = p.stock <= 0;
      var bajo = p.stockMin > 0 && p.stock <= p.stockMin;
      var badge = agotado ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
        bajo ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      var badgeTxt = agotado ? 'Agotado' : bajo ? 'Bajo' : p.stock;
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-2"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">' + p.nombre.charAt(0).toUpperCase() + '</div><div><p class="text-sm font-medium text-slate-950 dark:text-white">' + p.nombre + '</p><p class="text-xs text-slate-400 sm:hidden">' + p.categoriaNombre + '</p></div></div></td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">' + p.categoriaNombre + '</td>' +
        '<td class="py-3 px-2 text-center text-xs text-slate-400 hidden md:table-cell">' + (p.codigoInterno || p.codigoBarras || '—') + '</td>' +
        '<td class="py-3 px-2 text-center"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + badge + '">' + badgeTxt + '</span></td>' +
        '<td class="py-3 px-2 text-right text-sm font-medium text-slate-950 dark:text-white">' + formatearMoneda(p.precio) + '</td>' +
        '<td class="py-3 px-2 text-right hidden sm:table-cell"><div class="flex gap-1 justify-end">' +
        '<button class="btn-editar text-xs text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors px-2 py-1" data-id="' + p.detalleId + '">Editar</button>' +
        '<button class="btn-eliminar text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1" data-id="' + p.detalleId + '">Eliminar</button>' +
        '</div></td></tr>';
    }).join('');
  }

  function limpiarFormulario() {
    $('form-titulo').textContent = 'Nuevo Producto';
    $('form-producto-id').textContent = '';
    EDITANDO_ID = null;
    [ 'campo-nombre', 'campo-codigo-interno', 'campo-codigo-barras', 'campo-marca', 'campo-modelo', 'campo-descripcion',
      'campo-precio-venta', 'campo-precio-compra', 'campo-precio-mayorista', 'campo-tags', 'campo-stock-min', 'campo-stock-max'
    ].forEach(function (id) { $(id).value = ''; });
    $('campo-stock').value = '0';
    $('campo-descuento-max').value = '0';
    $('campo-margen').value = '';
    $('campo-categoria').value = '';
    $('campo-impuesto').value = '19';
    $('campo-activo').checked = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cargarProductoEnForm(detalleId) {
    var p = PRODUCTOS.find(function (x) { return x.detalleId === detalleId; });
    if (!p) return;
    EDITANDO_ID = detalleId;
    $('form-titulo').textContent = 'Editar Producto';
    $('form-producto-id').textContent = p.nombre;
    $('campo-nombre').value = p.nombre;
    $('campo-codigo-interno').value = p.codigoInterno;
    $('campo-codigo-barras').value = p.codigoBarras;
    $('campo-marca').value = p.marca;
    $('campo-modelo').value = p.modelo;
    $('campo-descripcion').value = p.descripcion;
    $('campo-precio-venta').value = p.precio;
    $('campo-precio-compra').value = p.precioCompra;
    $('campo-margen').value = p.margen > 0 ? p.margen + '%' : '';
    $('campo-descuento-max').value = p.descuentoMax;
    $('campo-precio-mayorista').value = p.precioMayorista;
    $('campo-stock').value = p.stock;
    $('campo-stock-min').value = p.stockMin;
    $('campo-stock-max').value = p.stockMax;
    $('campo-categoria').value = p.categoriaId;
    $('campo-tags').value = (p.tags || []).join(', ');
    $('campo-activo').checked = p.activo;
    var tasa = Math.round((p.tasaImpuesto || 0) * 100);
    $('campo-impuesto').value = tasa;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function guardarProducto() {
    if (_guardando) return;
    var nombre = $('campo-nombre').value.trim();
    if (!nombre) { mostrarToast('El nombre del producto es obligatorio'); return; }
    var categoriaId = $('campo-categoria').value;
    if (!categoriaId) { mostrarToast('Selecciona una categoría'); return; }
    var precioVenta = parseFloat($('campo-precio-venta').value) || 0;
    if (precioVenta <= 0) { mostrarToast('El precio de venta debe ser mayor a 0'); return; }

    _guardando = true;
    $('btn-guardar').disabled = true;
    $('btn-guardar').textContent = 'Guardando...';

    try {
      var usuario = window.KubitAuth.obtenerUsuario();
      var userId = usuario ? usuario.id : null;

      var productoData = {
        nombre: nombre,
        categoria_id: categoriaId,
        marca: $('campo-marca').value.trim() || null,
        modelo: $('campo-modelo').value.trim() || null,
        descripcion: $('campo-descripcion').value.trim() || null,
        tasa_impuesto: parseFloat($('campo-impuesto').value) / 100 || 0.19,
        activo: $('campo-activo').checked,
        tags: $('campo-tags').value.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
        created_by: userId,
        updated_by: userId
      };

      var detalleData = {
        codigo_interno: $('campo-codigo-interno').value.trim() || null,
        codigo_barras: $('campo-codigo-barras').value.trim() || null,
        precio_compra: parseFloat($('campo-precio-compra').value) || 0,
        precio_venta: precioVenta,
        precio_mayorista: parseFloat($('campo-precio-mayorista').value) || null,
        descuento_max: parseInt($('campo-descuento-max').value) || 0,
        stock_actual: parseInt($('campo-stock').value) || 0,
        stock_min: parseInt($('campo-stock-min').value) || 0,
        stock_max: parseInt($('campo-stock-max').value) || 0,
        created_by: userId,
        updated_by: userId
      };

      if (EDITANDO_ID) {
        var p = PRODUCTOS.find(function (x) { return x.detalleId === EDITANDO_ID; });
        if (p) {
          productoData.id = p.productoId;
          var r1 = await DB.productos.actualizar(p.productoId, productoData);
          if (r1.error) { mostrarToast('Error: ' + r1.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar'; return; }
          var r2 = await DB.productos.detalleActualizar(EDITANDO_ID, detalleData);
          if (r2.error) { mostrarToast('Error: ' + r2.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar'; return; }
          mostrarToast('Producto actualizado');
        }
      } else {
        var r1 = await DB.productos.crear(productoData);
        if (r1.error) { mostrarToast('Error: ' + r1.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar'; return; }
        var nuevoProductoId = r1.data[0].id;
        detalleData.producto_id = nuevoProductoId;
        var r2 = await DB.productos.detalleCrear(detalleData);
        if (r2.error) { mostrarToast('Error al crear detalle: ' + r2.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar'; return; }
        mostrarToast('Producto creado');
      }

      limpiarFormulario();
      await cargarProductos();
    } catch (e) {
      console.error('[Productos] Error guardar:', e);
      mostrarToast('Error inesperado');
    }

    _guardando = false;
    $('btn-guardar').disabled = false;
    $('btn-guardar').textContent = 'Guardar';
  }

  async function eliminarProducto(detalleId) {
    if (!confirm('¿Eliminar este producto?')) return;
    var p = PRODUCTOS.find(function (x) { return x.detalleId === detalleId; });
    if (!p) return;
    var r = await DB.productos.eliminar(p.productoId);
    if (r.error) { mostrarToast('Error: ' + r.error); return; }
    mostrarToast('Producto eliminado');
    if (EDITANDO_ID === detalleId) limpiarFormulario();
    await cargarProductos();
  }

  function filtrarProductos() {
    var q = $('buscador-productos').value.toLowerCase().trim();
    var catId = $('filtro-categoria').value;
    var filtrados = PRODUCTOS.filter(function (p) {
      var matchCat = !catId || p.categoriaId === catId;
      var matchQ = !q || p.nombre.toLowerCase().includes(q) || (p.codigoInterno || '').toLowerCase().includes(q) || (p.codigoBarras || '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });
    renderizarTabla(filtrados);
  }

  function formatearMoneda(valor) {
    return '$' + valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function mostrarToast(msg) {
    var el = $('toast');
    if (!el) {
      var t = document.createElement('div');
      t.id = 'toast';
      t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 opacity-0 translate-y-4 pointer-events-none';
      document.body.appendChild(t);
      el = t;
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

  function bindearEventos() {
    $('btn-dark').addEventListener('click', function () {
      html.classList.toggle('dark');
      localStorage.setItem('darkMode', html.classList.contains('dark'));
    });

    $('btn-limpiar-form').addEventListener('click', limpiarFormulario);
    $('btn-guardar').addEventListener('click', guardarProducto);

    $('buscador-productos').addEventListener('input', filtrarProductos);
    $('filtro-categoria').addEventListener('change', filtrarProductos);

    // Calcular margen automático
    function calcMargen() {
      var venta = parseFloat($('campo-precio-venta').value) || 0;
      var compra = parseFloat($('campo-precio-compra').value) || 0;
      if (venta > 0 && compra > 0) {
        $('campo-margen').value = Math.round((venta - compra) / compra * 100) + '%';
      } else {
        $('campo-margen').value = '';
      }
    }
    $('campo-precio-venta').addEventListener('input', calcMargen);
    $('campo-precio-compra').addEventListener('input', calcMargen);

    // Delegación para botones de tabla
    $('productos-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-editar')) cargarProductoEnForm(btn.dataset.id);
      if (btn.classList.contains('btn-eliminar')) eliminarProducto(btn.dataset.id);
    });

    // Enter en buscador
    $('buscador-productos').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') filtrarProductos();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
