/* ============================================================
   database.js — Servicio de Base de Datos (CRUD generico)
   ============================================================
   Dependencias: supabase.js (window.__supabase)
   Expone: window.DB con metodos genericos + especificos
   ============================================================ */

window.DB = (function () {
  var api = window.__supabase;
  if (!api) {
    console.error('[DB] ERROR: window.__supabase no disponible. Cargar supabase.js antes.');
    return {};
  }

  /* ════════════════════════════════════════════════════════════
     CACHE
     ════════════════════════════════════════════════════════════ */
  var _cache = new Map();
  var CACHE_TTL = 60000; // 60s default

  function _cacheGet(key) {
    var entry = _cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expira) { _cache.delete(key); return null; }
    return entry.data;
  }

  function _cacheSet(key, data, ttl) {
    _cache.set(key, { data: data, expira: Date.now() + (ttl || CACHE_TTL) });
  }

  function _cacheClear(prefix) {
    if (!prefix) { _cache.clear(); return; }
    _cache.forEach(function (_, key) {
      if (key.indexOf(prefix) === 0) _cache.delete(key);
    });
  }

  /* ════════════════════════════════════════════════════════════
     QUERY STRING BUILDER (PostgREST)
     ════════════════════════════════════════════════════════════ */
  function _buildQuery(opts) {
    var parts = [];

    // Select columns con joins: "*,categoria:categoria_id(nombre)"
    parts.push('select=' + encodeURIComponent(opts.select || '*'));

    // Filtros exactos
    (opts.filters || []).forEach(function (f) {
      if (f.val === null || f.val === undefined) return;
      parts.push(encodeURIComponent(f.col) + '=' + encodeURIComponent(f.op || 'eq') + '.' + encodeURIComponent(f.val));
    });

    // Busqueda ilike multi-campo
    if (opts.search) {
      var searchFields = opts.searchFields || ['nombre'];
      var orParts = searchFields.map(function (f) {
        return f + '.ilike.%25' + encodeURIComponent(opts.search) + '%25';
      });
      parts.push('or=(' + orParts.join(',') + ')');
    }

    // Filtro por categoria (directo)
    if (opts.categoriaId) {
      parts.push(encodeURIComponent('categoria_id') + '=eq.' + encodeURIComponent(opts.categoriaId));
    }

    // Soft-delete: excluir deleted_at is not null
    if (!opts.incluirEliminados) {
      parts.push('deleted_at=is.null');
    }

    // Orden
    if (opts.orderBy) {
      var dir = opts.orderDir === 'desc' ? '.desc' : '.asc';
      parts.push('order=' + encodeURIComponent(opts.orderBy) + dir);
    }

    // Paginacion
    if (opts.page && opts.pageSize) {
      var offset = (opts.page - 1) * opts.pageSize;
      parts.push('offset=' + offset);
      parts.push('limit=' + opts.pageSize);
    } else if (opts.limit) {
      parts.push('limit=' + opts.limit);
    }

    return parts.join('&');
  }

  /* ════════════════════════════════════════════════════════════
     GENERIC CRUD
     ════════════════════════════════════════════════════════════ */
  function _esErrorAuth(msj) {
    return msj && (msj.indexOf('401') !== -1 || msj.indexOf('JWT') !== -1 || msj.indexOf('expired') !== -1);
  }

  async function select(tabla, opts) {
    try {
      var qs = _buildQuery(opts || {});
      var usarMeta = opts && opts.page && opts.pageSize;
      if (usarMeta) {
        var meta = await api.getWithMeta(tabla + '?' + qs, { page: opts.page, pageSize: opts.pageSize });
        return { data: meta.data || [], error: null, count: meta.data.length, total: meta.total };
      }
      var data = await api.get(tabla + '?' + qs);
      var count = (data && data.length) || 0;
      return { data: data || [], error: null, count: count };
    } catch (e) {
      console.error('[DB] select error:', tabla, e);
      if (_esErrorAuth(e.message) && window.KubitAuth && window.KubitAuth.manejarErrorAuth) {
        window.KubitAuth.manejarErrorAuth();
      }
      return { data: [], error: e.message, count: 0 };
    }
  }

  async function insert(tabla, data) {
    try {
      var result = await api.post(tabla, data);
      return { data: result, error: null };
    } catch (e) {
      console.error('[DB] insert error:', tabla, e);
      return { data: null, error: e.message };
    }
  }

  async function update(tabla, id, data) {
    try {
      var result = await api.patch(tabla + '?id=eq.' + id, data);
      return { data: result, error: null };
    } catch (e) {
      console.error('[DB] update error:', tabla, e);
      return { data: null, error: e.message };
    }
  }

  async function softDelete(tabla, id) {
    try {
      await api.patch(tabla + '?id=eq.' + id, { deleted_at: new Date().toISOString() });
      return { error: null };
    } catch (e) {
      console.error('[DB] softDelete error:', tabla, e);
      return { error: e.message };
    }
  }

  /* ════════════════════════════════════════════════════════════
     ENTITY: PRODUCTOS
     ════════════════════════════════════════════════════════════ */
  var productos = {
    listar: async function (opts) {
      return select('pos_productos', Object.assign({
        select: '*,categoria:categoria_id(id,nombre)',
        orderBy: 'nombre',
        searchFields: ['nombre']
      }, opts || {}));
    },

    listarConDetalle: async function (opts) {
      var cacheKey = 'productos_detalle';
      var cached = _cacheGet(cacheKey);
      if (cached) return cached;

      var res = await select('pos_productos_detalle', Object.assign({
        select: '*,producto:producto_id(id,nombre,slug,categoria_id,tasa_impuesto,activo,tags,marca,modelo,descripcion,categoria:categoria_id(id,nombre))',
        orderBy: 'created_at'
      }, opts || {}));

      var data = (res.data || []).filter(function (d) {
        return d.producto && d.producto.activo !== false;
      });

      var result = { data: data, error: res.error, count: data.length, total: res.total };

      if (!opts || !opts.skipCache) {
        _cacheSet(cacheKey, result, 30000);
      }
      return result;
    },

    obtener: async function (id) {
      var res = await select('pos_productos', {
        select: '*,categoria:categoria_id(id,nombre)',
        filters: [{ col: 'id', val: id }],
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    buscar: async function (termino, opts) {
      return select('pos_productos', Object.assign({
        select: '*,categoria:categoria_id(id,nombre)',
        search: termino,
        searchFields: ['nombre'],
        limit: 20
      }, opts || {}));
    },

    buscarPorCategoria: async function (categoriaId, opts) {
      return select('pos_productos', Object.assign({
        select: '*,categoria:categoria_id(id,nombre)',
        categoriaId: categoriaId,
        orderBy: 'nombre'
      }, opts || {}));
    },

    crear: async function (data) { _cacheClear('productos'); return insert('pos_productos', data); },
    actualizar: async function (id, data) { _cacheClear('productos'); return update('pos_productos', id, data); },
    eliminar: async function (id) { _cacheClear('productos'); return softDelete('pos_productos', id); },

    listarDetalleActivos: async function (opts) {
      var res = await select('pos_productos_detalle', Object.assign({
        select: '*,producto:producto_id(id,nombre,slug,categoria_id,tasa_impuesto,activo,tags,marca,modelo,descripcion,categoria:categoria_id(id,nombre))',
        orderBy: 'producto_id'
      }, opts || {}));
      var data = (res.data || []).filter(function (d) {
        return d.producto && d.producto.activo !== false;
      });
      return { data: data, error: res.error, count: data.length };
    },

    detalleCrear: async function (data) { _cacheClear('productos'); return insert('pos_productos_detalle', data); },
    detalleActualizar: async function (id, data) { _cacheClear('productos'); return update('pos_productos_detalle', id, data); },
    detalleEliminar: async function (id) { _cacheClear('productos'); return softDelete('pos_productos_detalle', id); },
    detalleObtener: async function (id) {
      var res = await select('pos_productos_detalle', {
        select: '*,producto:producto_id(id,nombre,slug,categoria_id,tasa_impuesto,activo,tags,marca,modelo,descripcion,categoria:categoria_id(id,nombre))',
        filters: [{ col: 'id', val: id }],
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    buscarPorCodigoInterno: async function (codigo, excluirId) {
      var opts = {
        select: 'id,producto:producto_id(id,nombre)',
        filters: [{ col: 'codigo_interno', val: codigo }],
        limit: 1
      };
      if (excluirId) {
        opts.filters.push({ col: 'id', op: 'neq', val: excluirId });
      }
      var res = await select('pos_productos_detalle', opts);
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    ajustarStock: async function (detalleId, cantidad, tipoMovimiento, motivo, opts) {
      var res = await productos.detalleObtener(detalleId);
      if (res.error || !res.data) return { data: null, error: res.error || 'Producto no encontrado' };
      var detalle = res.data;

      var nuevoStock = detalle.stock_actual + cantidad;
      if (nuevoStock < 0) return { data: null, error: 'Stock no puede ser negativo' };

      var upd = await update('pos_productos_detalle', detalleId, { stock_actual: nuevoStock });
      if (upd.error) return upd;

      var user = opts && opts.usuarioId || null;
      var movRes = await insert('pos_movimientos_inventario', {
        producto_detalle_id: detalleId,
        tipo_movimiento: tipoMovimiento,
        cantidad: Math.abs(cantidad),
        motivo: motivo || 'Ajuste manual',
        created_by: user
      });

      _cacheClear('productos');

      return { data: { stock_anterior: detalle.stock_actual, stock_nuevo: nuevoStock, movimiento: movRes.data }, error: null };
    }
  };

  /* ════════════════════════════════════════════════════════════
     ENTITY: CATEGORIAS
     ════════════════════════════════════════════════════════════ */
  var categorias = {
    listar: async function (opts) {
      var cacheKey = 'categorias_listar';
      var cached = _cacheGet(cacheKey);
      if (cached) return cached;

      var res = await select('pos_categorias', Object.assign({
        orderBy: 'nombre',
        filters: [{ col: 'activa', val: true }]
      }, opts || {}));

      _cacheSet(cacheKey, res, 30000); // 30s
      return res;
    },

    listarTodas: async function () {
      return select('pos_categorias', { orderBy: 'nombre' });
    },

    crear: async function (data) { _cacheClear('categorias'); return insert('pos_categorias', data); },
    actualizar: async function (id, data) { _cacheClear('categorias'); return update('pos_categorias', id, data); },
    eliminar: async function (id) { _cacheClear('categorias'); return softDelete('pos_categorias', id); }
  };

  /* ════════════════════════════════════════════════════════════
     ENTITY: CLIENTES
     ════════════════════════════════════════════════════════════ */
  var clientes = {
    listar: async function (opts) {
      return select('pos_clientes', Object.assign({
        orderBy: 'primer_nombre',
        searchFields: ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'numero_id', 'email']
      }, opts || {}));
    },

    obtener: async function (id) {
      var res = await select('pos_clientes', { filters: [{ col: 'id', val: id }], limit: 1 });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    buscar: async function (termino, opts) {
      return select('pos_clientes', Object.assign({
        search: termino,
        searchFields: ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'numero_id', 'email', 'celular'],
        limit: 15
      }, opts || {}));
    },

    crear: async function (data) { return insert('pos_clientes', data); },
    actualizar: async function (id, data) { return update('pos_clientes', id, data); },
    eliminar: async function (id) { return softDelete('pos_clientes', id); }
  };

  /* ════════════════════════════════════════════════════════════
     ENTITY: VENTAS
     ════════════════════════════════════════════════════════════ */
  var ventas = {
    listarRecientes: async function (opts) {
      return select('pos_ventas', Object.assign({
        select: '*,cliente:cliente_id(id,primer_nombre,primer_apellido),usuario:usuario_id(id,nombre_completo)',
        orderBy: 'created_at',
        orderDir: 'desc',
        limit: 20
      }, opts || {}));
    },

    obtener: async function (id) {
      var res = await select('pos_ventas', {
        select: '*,cliente:cliente_id(*),usuario:usuario_id(*),canal:canal_id(*),detalles:pos_ventas_detalle(*,detalle:producto_detalle_id(*,producto:producto_id(nombre)))',
        filters: [{ col: 'id', val: id }],
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    crear: async function (ventaData) {
      return insert('pos_ventas', ventaData);
    },

    crearConDetalles: async function (ventaData, detalles) {
      var resVenta = await insert('pos_ventas', ventaData);
      if (resVenta.error || !resVenta.data || !resVenta.data.length) {
        return { data: null, error: resVenta.error || 'Error al crear venta' };
      }
      var ventaId = resVenta.data[0].id;

      var detallesConId = detalles.map(function (d) {
        d.venta_id = ventaId;
        return d;
      });

      try {
        await api.post('pos_ventas_detalle', detallesConId);
        return { data: resVenta.data[0], error: null };
      } catch (e) {
        console.error('[DB] Error al insertar detalles de venta:', e);
        return { data: null, error: e.message };
      }
    },

    listar: async function (opts) {
      var filters = [];
      if (opts) {
        if (opts.estado) filters.push({ col: 'estado', val: opts.estado });
        if (opts.canalId) filters.push({ col: 'canal_id', val: opts.canalId });
        if (opts.desde) filters.push({ col: 'fecha_venta', op: 'gte', val: opts.desde });
        if (opts.hasta) filters.push({ col: 'fecha_venta', op: 'lte', val: opts.hasta });
      }
      return select('pos_ventas', Object.assign({
        select: '*,cliente:cliente_id(id,primer_nombre,primer_apellido),usuario:usuario_id(id,nombre_completo),canal:canal_id(id,nombre,codigo)',
        filters: filters,
        search: (opts && opts.search) || null,
        searchFields: ['numero_venta', 'referencia_externa'],
        orderBy: 'fecha_venta',
        orderDir: 'desc',
        page: (opts && opts.page) || 1,
        pageSize: (opts && opts.pageSize) || 20
      }, opts || {}));
    },

    anular: async function (id) {
      return update('pos_ventas', id, { estado: 'ANULADA' });
    },

    obtenerPorPeriodo: async function (usuarioId, desde, hasta, opts) {
      var filters = [
        { col: 'estado', val: 'CONFIRMADA' }
      ];
      if (usuarioId) filters.push({ col: 'usuario_id', val: usuarioId });
      if (desde) filters.push({ col: 'fecha_venta', op: 'gte', val: desde });
      if (hasta) filters.push({ col: 'fecha_venta', op: 'lte', val: hasta });

      return select('pos_ventas', Object.assign({
        select: 'id,metodo_pago,subtotal,impuesto,descuento,total,costo_cargo_venta,costo_impuestos,costo_envios',
        filters: filters,
        orderBy: 'fecha_venta',
        orderDir: 'desc'
      }, opts || {}));
    }
  };

  /* ════════════════════════════════════════════════════════════
     ENTITY: CAJAS
     ════════════════════════════════════════════════════════════ */
  var cajas = {
    listar: async function () {
      var cacheKey = 'cajas_listar';
      var cached = _cacheGet(cacheKey);
      if (cached) return cached;

      var res = await select('pos_cajas', {
        filters: [{ col: 'activa', val: true }],
        orderBy: 'nombre'
      });

      _cacheSet(cacheKey, res, 30000);
      return res;
    }
  };

  /* ════════════════════════════════════════════════════════════
     ENTITY: CAJA APERTURA
     ════════════════════════════════════════════════════════════ */
  var cajaApertura = {
    obtenerActiva: async function (cajaId) {
      var res = await select('pos_caja_apertura', {
        filters: [
          { col: 'caja_id', val: cajaId },
          { col: 'estado', val: 'abierta' }
        ],
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    abrir: async function (data) {
      _cacheClear('caja');
      return insert('pos_caja_apertura', data);
    },

    cerrar: async function (id, montoFinal, montoEsperado, diferencia) {
      _cacheClear('caja');
      return update('pos_caja_apertura', id, {
        fecha_cierre: new Date().toISOString(),
        monto_final: montoFinal,
        monto_esperado: montoEsperado,
        diferencia: diferencia,
        estado: 'cerrada'
      });
    },

    historial: async function (cajaId, opts) {
      return select('pos_caja_apertura', Object.assign({
        filters: [{ col: 'caja_id', val: cajaId }],
        orderBy: 'fecha_apertura',
        orderDir: 'desc'
      }, opts || {}));
    }
  };

  /* ════════════════════════════════════════════════════════════
     ENTITY: MOVIMIENTOS INVENTARIO
     ════════════════════════════════════════════════════════════ */
  var movimientosInventario = {
    listar: async function (opts) {
      return select('pos_movimientos_inventario', Object.assign({
        select: '*,producto_detalle:producto_detalle_id(id,stock_actual,codigo_interno,producto:producto_id(id,nombre,categoria:categoria_id(id,nombre)))',
        orderBy: 'fecha',
        orderDir: 'desc',
        limit: 100
      }, opts || {}));
    },

    crear: async function (data) { return insert('pos_movimientos_inventario', data); },

    obtenerPorProducto: async function (productoDetalleId, opts) {
      return select('pos_movimientos_inventario', Object.assign({
        filters: [{ col: 'producto_detalle_id', val: productoDetalleId }],
        orderBy: 'fecha',
        orderDir: 'desc',
        limit: 50
      }, opts || {}));
    }
  };

  /* ════════════════════════════════════════════════════════════
     ENTITY: METODOS DE PAGO
     ════════════════════════════════════════════════════════════ */
  var metodosPago = {
    listar: async function () {
      var cacheKey = 'metodos_pago';
      var cached = _cacheGet(cacheKey);
      if (cached) return cached;

      var res = await select('pos_metodos_pago', {
        filters: [{ col: 'activo', val: true }],
        orderBy: 'nombre'
      });

      _cacheSet(cacheKey, res, 60000);
      return res;
    }
  };

  /* ════════════════════════════════════════════════════════════
     ENTITY: CANALES DE VENTA
     ════════════════════════════════════════════════════════════ */
  var canalesVenta = {
    obtenerPorCodigo: async function (codigo) {
      var cacheKey = 'canal_' + codigo;
      var cached = _cacheGet(cacheKey);
      if (cached) return cached;

      var res = await select('pos_canales_venta', {
        filters: [{ col: 'codigo', val: codigo }],
        limit: 1
      });
      var result = { data: res.data && res.data[0] || null, error: res.error };
      if (result.data) _cacheSet(cacheKey, result, 60000);
      return result;
    }
  };

  /* ════════════════════════════════════════════════════════════
      ENTITY: PRODUCTOS MULTIMEDIA
      ════════════════════════════════════════════════════════════ */
  var productosMultimedia = {
    listar: async function (productoId) {
      return select('pos_productos_multimedia', {
        filters: [{ col: 'producto_id', val: productoId }],
        orderBy: 'orden'
      });
    },
    crear: async function (data) { return insert('pos_productos_multimedia', data); },
    actualizar: async function (id, data) { return update('pos_productos_multimedia', id, data); },
    eliminar: async function (id) { return softDelete('pos_productos_multimedia', id); }
  };

  /* ════════════════════════════════════════════════════════════
      ENTITY: PROVEEDORES
      ════════════════════════════════════════════════════════════ */
  var proveedores = {
    listar: async function (opts) {
      return select('pos_proveedores', Object.assign({
        orderBy: 'razon_social',
        searchFields: ['razon_social', 'numero_id', 'email', 'celular']
      }, opts || {}));
    },

    obtener: async function (id) {
      var res = await select('pos_proveedores', { filters: [{ col: 'id', val: id }], limit: 1 });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    buscar: async function (termino, opts) {
      return select('pos_proveedores', Object.assign({
        search: termino,
        searchFields: ['razon_social', 'numero_id', 'email', 'celular'],
        limit: 15
      }, opts || {}));
    },

    crear: async function (data) { return insert('pos_proveedores', data); },
    actualizar: async function (id, data) { return update('pos_proveedores', id, data); },
    eliminar: async function (id) { return softDelete('pos_proveedores', id); }
  };

  /* ════════════════════════════════════════════════════════════
      ENTITY: COMPRAS
      ════════════════════════════════════════════════════════════ */
  var compras = {
    listar: async function (opts) {
      return select('pos_compras', Object.assign({
        select: '*,proveedor:proveedor_id(id,razon_social,numero_id),usuario:usuario_id(id,nombre_completo)',
        orderBy: 'fecha_compra',
        orderDir: 'desc',
        searchFields: ['numero_orden', 'notas']
      }, opts || {}));
    },

    obtener: async function (id) {
      var res = await select('pos_compras', {
        select: '*,proveedor:proveedor_id(*),usuario:usuario_id(*),detalles:pos_compras_detalle(*)',
        filters: [{ col: 'id', val: id }],
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    obtenerSiguienteNumeroOrden: async function () {
      try {
        var data = await api.get('pos_compras?select=numero_orden&order=numero_orden.desc&limit=1');
        var ultimo = (data && data.length && data[0].numero_orden) || 0;
        return { data: (parseInt(ultimo) || 0) + 1, error: null };
      } catch (e) {
        console.error('[DB] Error obteniendo siguiente numero orden:', e);
        return { data: 1, error: e.message };
      }
    },

    crear: async function (compraData) {
      return insert('pos_compras', compraData);
    },

    crearConDetalles: async function (compraData, detalles) {
      var resCompra = await insert('pos_compras', compraData);
      if (resCompra.error || !resCompra.data || !resCompra.data.length) {
        return { data: null, error: resCompra.error || 'Error al crear compra' };
      }
      var compraId = resCompra.data[0].id;

      var detallesConId = detalles.map(function (d) {
        d.compra_id = compraId;
        return d;
      });

      try {
        await api.post('pos_compras_detalle', detallesConId);
        return { data: resCompra.data[0], error: null };
      } catch (e) {
        console.error('[DB] Error al insertar detalles de compra:', e);
        return { data: null, error: e.message };
      }
    },

    actualizar: async function (id, data) {
      return update('pos_compras', id, data);
    },

    actualizarEstado: async function (id, estado) {
      return update('pos_compras', id, { estado: estado });
    },

    obtenerConDetalles: async function (id) {
      var res = await select('pos_compras', {
        select: '*,proveedor:proveedor_id(*),usuario:usuario_id(*),detalles:pos_compras_detalle(*,producto_detalle:producto_detalle_id(*,producto:producto_id(*)))',
        filters: [{ col: 'id', val: id }],
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    eliminar: async function (id) { return softDelete('pos_compras', id); }
  };

  /* ════════════════════════════════════════════════════════════
      ENTITY: COMPRAS DETALLE
      ════════════════════════════════════════════════════════════ */
  var comprasDetalle = {
    listarPorCompra: async function (compraId) {
      return select('pos_compras_detalle', {
        select: '*,producto_detalle:producto_detalle_id(id,codigo_interno,stock_actual,producto:producto_id(id,nombre,marca,modelo))',
        filters: [{ col: 'compra_id', val: compraId }],
        orderBy: 'created_at'
      });
    },

    crear: async function (data) { return insert('pos_compras_detalle', data); },
    actualizar: async function (id, data) { return update('pos_compras_detalle', id, data); },
    eliminar: async function (id) { return softDelete('pos_compras_detalle', id); },

    recibir: async function (id, cantidad, usuarioId) {
      try {
        var resDet = await select('pos_compras_detalle', {
          select: '*,compra:compra_id(*)',
          filters: [{ col: 'id', val: id }],
          limit: 1
        });
        if (!resDet.data || !resDet.data.length) {
          return { data: null, error: 'Detalle de compra no encontrado' };
        }
        var detalle = resDet.data[0];
        var nuevaRecibida = (detalle.cantidad_recibida || 0) + cantidad;
        if (nuevaRecibida > detalle.cantidad) {
          return { data: null, error: 'Cantidad a recibir excede lo ordenado' };
        }

        var nuevoEstadoDet = nuevaRecibida >= detalle.cantidad ? 'RECIBIDO' : 'PENDIENTE';

        var updRes = await update('pos_compras_detalle', id, {
          cantidad_recibida: nuevaRecibida,
          estado_detalle: nuevoEstadoDet,
          updated_by: usuarioId
        });
        if (updRes.error) return updRes;

        var movRes = await insert('pos_movimientos_inventario', {
          producto_detalle_id: detalle.producto_detalle_id,
          tipo_movimiento: 'entrada_compra',
          cantidad: cantidad,
          motivo: 'Recepcion de compra',
          referencia: 'OC-' + (detalle.compra && detalle.compra.numero_orden || ''),
          created_by: usuarioId
        });
        if (movRes.error) {
          console.error('[DB] Error al crear movimiento inventario:', movRes.error);
        }

        var detActual = await select('pos_productos_detalle', {
          filters: [{ col: 'id', val: detalle.producto_detalle_id }],
          limit: 1
        });
        if (detActual.data && detActual.data.length) {
          var stockActual = parseInt(detActual.data[0].stock_actual || 0);
          await update('pos_productos_detalle', detalle.producto_detalle_id, {
            stock_actual: stockActual + cantidad
          });
        }

        var checkTodos = await select('pos_compras_detalle', {
          select: 'id,estado_detalle',
          filters: [{ col: 'compra_id', val: detalle.compra_id }]
        });
        if (!checkTodos.error && checkTodos.data && checkTodos.data.length) {
          var todosRecibidos = checkTodos.data.every(function (d) { return d.estado_detalle === 'RECIBIDO'; });
          var algunRecibido = checkTodos.data.some(function (d) { return d.estado_detalle === 'RECIBIDO'; });
          if (todosRecibidos) {
            await update('pos_compras', detalle.compra_id, { estado: 'RECIBIDA' });
          } else if (algunRecibido) {
            await update('pos_compras', detalle.compra_id, { estado: 'RECIBIENDO' });
          }
        }

        var compraActualizada = await select('pos_compras', {
          select: '*,proveedor:proveedor_id(id,razon_social,numero_id)',
          filters: [{ col: 'id', val: detalle.compra_id }],
          limit: 1
        });

        return {
          data: {
            detalle: { id: id, cantidad_recibida: nuevaRecibida, estado_detalle: nuevoEstadoDet },
            compra: compraActualizada.data && compraActualizada.data[0] || null
          },
          error: null
        };
      } catch (e) {
        console.error('[DB] Error al recibir detalle:', e);
        return { data: null, error: e.message };
      }
    }
  };

  /* ════════════════════════════════════════════════════════════
      ENTITY: FACTURACION
      ════════════════════════════════════════════════════════════ */
  var facturacion = {
    listar: async function (opts) {
      return select('pos_facturacion', Object.assign({
        select: '*,venta:venta_id(id,total,created_at,fecha_venta,estado)',
        orderBy: 'created_at',
        orderDir: 'desc',
        searchFields: ['numero', 'serie', 'cliente_nombre', 'cliente_numero_id']
      }, opts || {}));
    },

    obtener: async function (id) {
      var res = await select('pos_facturacion', {
        select: '*,venta:venta_id(id,total,created_at,fecha_venta,estado,usuario:usuario_id(nombre_completo))',
        filters: [{ col: 'id', val: id }],
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    crear: async function (data) { return insert('pos_facturacion', data); },
    actualizar: async function (id, data) { return update('pos_facturacion', id, data); },
    eliminar: async function (id) { return softDelete('pos_facturacion', id); },

    emitir: async function (id) {
      return update('pos_facturacion', id, { estado: 'EMITIDA' });
    },

    anular: async function (id) {
      return update('pos_facturacion', id, { estado: 'ANULADA' });
    }
  };

  /* ════════════════════════════════════════════════════════════
      ENTITY: GASTOS
      ════════════════════════════════════════════════════════════ */
  var gastos = {
    listar: async function (opts) {
      return select('pos_gastos_mensuales_detalle', Object.assign({
        select: '*,categoria:categoria_id(id,nombre,descripcion)',
        orderBy: 'created_at',
        orderDir: 'desc'
      }, opts || {}));
    },

    listarPorPeriodo: async function (anio, mes, opts) {
      return select('pos_gastos_mensuales_detalle', Object.assign({
        select: '*,categoria:categoria_id(id,nombre,descripcion)',
        filters: [
          { col: 'anio', val: anio },
          { col: 'mes', val: mes }
        ],
        orderBy: 'created_at',
        orderDir: 'desc'
      }, opts || {}));
    },

    obtener: async function (id) {
      var res = await select('pos_gastos_mensuales_detalle', {
        filters: [{ col: 'id', val: id }],
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    crear: async function (data) { return insert('pos_gastos_mensuales_detalle', data); },
    actualizar: async function (id, data) { return update('pos_gastos_mensuales_detalle', id, data); },
    eliminar: async function (id) { return softDelete('pos_gastos_mensuales_detalle', id); }
  };

  /* ════════════════════════════════════════════════════════════
      ENTITY: GASTO CATEGORIAS
      ════════════════════════════════════════════════════════════ */
  var gastoCategorias = {
    listar: async function (opts) {
      return select('pos_gasto_categorias', Object.assign({
        orderBy: 'nombre'
      }, opts || {}));
    },

    listarActivas: async function () {
      return select('pos_gasto_categorias', {
        filters: [{ col: 'activa', val: true }],
        orderBy: 'nombre'
      });
    },

    obtener: async function (id) {
      var res = await select('pos_gasto_categorias', {
        filters: [{ col: 'id', val: id }],
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    crear: async function (data) { return insert('pos_gasto_categorias', data); },
    actualizar: async function (id, data) { return update('pos_gasto_categorias', id, data); },
    eliminar: async function (id) { return softDelete('pos_gasto_categorias', id); }
  };

  /* ════════════════════════════════════════════════════════════
      ENTITY: FINANZAS MENSUALES
      ════════════════════════════════════════════════════════════ */
  var finanzasMensuales = {
    listar: async function (opts) {
      return select('pos_finanzas_mensuales', Object.assign({
        orderBy: 'anio',
        orderDir: 'desc'
      }, opts || {}));
    },

    obtenerPorPeriodo: async function (anio, mes) {
      var res = await select('pos_finanzas_mensuales', {
        filters: [
          { col: 'anio', val: anio },
          { col: 'mes', val: mes }
        ],
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    crear: async function (data) { return insert('pos_finanzas_mensuales', data); },
    actualizar: async function (id, data) { return update('pos_finanzas_mensuales', id, data); },
    eliminar: async function (id) { return softDelete('pos_finanzas_mensuales', id); },
    actualizarPorVenta: async function (anio, mes, ventaBruta, descuento, costoComision, costoMercaderia) {
      try {
        await api.rpc('actualizar_finanzas_mensuales', {
          p_anio: anio,
          p_mes: mes,
          p_venta_bruta: ventaBruta,
          p_descuento: descuento,
          p_costo_comision: costoComision,
          p_costo_mercaderia: costoMercaderia
        });
        return { error: null };
      } catch (e) {
        console.error('[DB] Error actualizando finanzas:', e);
        return { error: e.message };
      }
    }
  };

  /* ════════════════════════════════════════════════════════════
      ENTITY: CONFIGURACION EMPRESA (singleton)
      ════════════════════════════════════════════════════════════ */
  var configuracionEmpresa = {
    obtener: async function () {
      var res = await select('pos_configuracion_empresa', {
        orderBy: 'created_at',
        limit: 1
      });
      return { data: res.data && res.data[0] || null, error: res.error };
    },

    guardar: async function (data) {
      var existe = await configuracionEmpresa.obtener();
      if (existe.data) {
        return update('pos_configuracion_empresa', existe.data.id, data);
      }
      return insert('pos_configuracion_empresa', data);
    }
  };

  /* ════════════════════════════════════════════════════════════
      API PUBLICA
      ════════════════════════════════════════════════════════════ */
  return {
    // Genericos
    select: select,
    insert: insert,
    update: update,
    softDelete: softDelete,

    // Cache
    cacheClear: _cacheClear,

    // Entidades
    productos: productos,
    categorias: categorias,
    clientes: clientes,
    proveedores: proveedores,
    ventas: ventas,
    compras: compras,
    comprasDetalle: comprasDetalle,
    cajas: cajas,
    cajaApertura: cajaApertura,
    metodosPago: metodosPago,
    canalesVenta: canalesVenta,
    movimientosInventario: movimientosInventario,
    productosMultimedia: productosMultimedia,
    facturacion: facturacion,
    gastos: gastos,
    gastoCategorias: gastoCategorias,
    finanzasMensuales: finanzasMensuales,
    configuracionEmpresa: configuracionEmpresa
  };
})();

/* ════════════════════════════════════════════════════════════
    AUTO: Cargar logo de empresa en el header de todas las paginas POS
    Busca el contenedor .w-8.h-8.bg-slate-950.rounded-lg y reemplaza
    la "K" por el logo si existe logo_url en la configuracion.
    ════════════════════════════════════════════════════════════ */
(function () {
  function cargarLogoHeader() {
    var container = document.querySelector('.w-8.h-8.bg-slate-950.rounded-lg');
    if (!container) return;

    DB.configuracionEmpresa.obtener().then(function (res) {
      if (!res.data || !res.data.logo_url) return;

      var img = document.createElement('img');
      img.src = res.data.logo_url;
      img.alt = 'Logo';
      img.className = 'h-8 w-auto max-w-[160px]';
      img.onerror = function () {
        container.innerHTML = '<span class="text-white dark:text-slate-950 font-bold text-sm">K</span>';
        container.className = 'w-8 h-8 bg-slate-950 dark:bg-white rounded-lg flex items-center justify-center shrink-0';
      };
      container.innerHTML = '';
      container.className = 'h-8 flex items-center shrink-0';
      container.appendChild(img);
    }).catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarLogoHeader);
  } else {
    cargarLogoHeader();
  }
})();

window.mostrarToast = function (msg, tipo) {
  var el = document.getElementById('toast');
  if (!el) return;
  var iconEl = document.getElementById('toast-icon');
  var msgEl = document.getElementById('toast-message');
  var closeEl = document.getElementById('toast-close');

  if (msgEl) msgEl.textContent = msg;

  if (iconEl) {
    iconEl.classList.remove('hidden');
    el.classList.remove('border-red-200', 'dark:border-red-800/50', 'border-emerald-200', 'dark:border-emerald-800/50', 'border-sky-200', 'dark:border-sky-800/50');

    if (tipo) {
      var icons = {
        error: '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>',
        success: '<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        info: '<svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>'
      };
      iconEl.innerHTML = icons[tipo] || icons.info;
      if (tipo === 'error') el.classList.add('border-red-200', 'dark:border-red-800/50');
      else if (tipo === 'success') el.classList.add('border-emerald-200', 'dark:border-emerald-800/50');
      else el.classList.add('border-sky-200', 'dark:border-sky-800/50');
    } else {
      iconEl.classList.add('hidden');
    }
  }

  el.classList.add('show');

  if (closeEl) {
    closeEl.onclick = function () { el.classList.remove('show'); };
  }

  clearTimeout(el._timer);
  el._timer = setTimeout(function () { el.classList.remove('show'); }, 4000);
};
