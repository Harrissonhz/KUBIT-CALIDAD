/* ============================================================
   database.js — Servicio de Base de Datos (CRUD genérico)
   ============================================================
   Dependencias: supabase.js (window.__supabase)
   Expone: window.DB con métodos genéricos + específicos
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

    // Búsqueda ilike multi-campo
    if (opts.search) {
      var searchFields = opts.searchFields || ['nombre'];
      var orParts = searchFields.map(function (f) {
        return f + '.ilike.%25' + encodeURIComponent(opts.search) + '%25';
      });
      parts.push('or=(' + orParts.join(',') + ')');
    }

    // Filtro por categoría (directo)
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

    // Paginación
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
  async function select(tabla, opts) {
    try {
      var qs = _buildQuery(opts || {});
      var data = await api.get(tabla + '?' + qs);
      var count = (data && data.length) || 0;
      return { data: data || [], error: null, count: count };
    } catch (e) {
      console.error('[DB] select error:', tabla, e);
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

      var result = { data: data, error: res.error, count: data.length };

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
    eliminar: async function (id) { _cacheClear('productos'); return softDelete('pos_productos', id); }
  };

  /* ════════════════════════════════════════════════════════════
     ENTITY: CATEGORÍAS
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
        select: '*,cliente:cliente_id(*),usuario:usuario_id(*),detalles:pos_ventas_detalle(*)',
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
     ENTITY: MÉTODOS DE PAGO (alias)
     ════════════════════════════════════════════════════════════ */

  /* ════════════════════════════════════════════════════════════
     API PÚBLICA
     ════════════════════════════════════════════════════════════ */
  return {
    // Genéricos
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
    ventas: ventas,
    cajas: cajas,
    cajaApertura: cajaApertura,
    metodosPago: metodosPago,
    canalesVenta: canalesVenta
  };
})();
