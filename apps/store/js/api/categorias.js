window.StoreAPI = window.StoreAPI || {};

function _slugify(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

var promosFijas = [
  { id: 'promo-imperdibles', nombre: 'Imperdibles', slug: 'imperdibles', icono: '', tipo: 'promo', orden: 1 },
  { id: 'promo-super-oferta', nombre: 'Super Oferta', slug: 'super-oferta', icono: '', tipo: 'promo', orden: 2 },
  { id: 'promo-remate', nombre: 'Remate Saldos', slug: 'remate-saldos', icono: '', tipo: 'promo', orden: 3 },
  { id: 'promo-producto-mes', nombre: 'Producto del Mes', slug: 'producto-mes', icono: '', tipo: 'promo', orden: 4 }
];

var _catCache = { datos: null, timestamp: 0 };
var CAT_CACHE_TTL = 60000;

async function _fetchCategoriasDB() {
  if (_catCache.datos && Date.now() - _catCache.timestamp < CAT_CACHE_TTL) return _catCache.datos;
  if (!window.__supabase) return [];
  try {
    var qs = 'select=id,nombre' +
      '&deleted_at=' + encodeURIComponent('is.null') +
      '&activa=' + encodeURIComponent('eq.true') +
      '&order=nombre.asc';
    var data = await window.__supabase.get('pos_categorias?' + qs);
    var cats = (data || []).map(function(c, i) {
      return {
        id: c.id,
        nombre: c.nombre,
        slug: _slugify(c.nombre),
        icono: '',
        tipo: 'categoria',
        orden: 5 + i
      };
    });
    _catCache.datos = cats;
    _catCache.timestamp = Date.now();
    return cats;
  } catch (e) {
    console.error('Error obteniendo categorías:', e);
    return [];
  }
}

window.StoreAPI.categorias = {
  async obtenerTodas() {
    var dbCats = await _fetchCategoriasDB();
    return [
      { id: 'cat-todos', nombre: 'Todos Los Productos', slug: 'todos', icono: '', tipo: 'view_all', orden: 0 },
      ...promosFijas,
      ...dbCats
    ];
  },

  async obtenerPorTipo(tipo) {
    var todas = await this.obtenerTodas();
    return todas.filter(function(c) { return c.tipo === tipo; });
  },

  async obtenerPorSlug(slug) {
    var todas = await this.obtenerTodas();
    for (var i = 0; i < todas.length; i++) {
      if (todas[i].slug === slug) return todas[i];
    }
    return null;
  },

  async obtenerNavegacion() {
    var todas = await this.obtenerTodas();
    return todas.filter(function(c) { return c.tipo === 'categoria'; });
  },

  async obtenerPromos() {
    return promosFijas;
  }
};
