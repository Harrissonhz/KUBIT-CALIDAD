/**
 * supabase.js — Cliente Supabase por fetch() directo (única instancia)
 * ====================================================================
 * Lee credenciales desde config.js.
 * Sin dependencias externas (no requiere CDN de supabase-js).
 * Expone window.__supabase con get/post/patch/delete y setAuth().
 */

if (typeof CONFIG === 'undefined') {
  console.error('[supabase.js] ERROR: No se encontró config.js. Copiar config.ejemplo.js a config.js y llenar las credenciales.');
}

(function() {
  var URL = CONFIG?.supabaseUrl || SUPABASE_URL;
  var KEY = CONFIG?.supabaseAnonKey || SUPABASE_ANON_KEY;

  var AUTH_TOKEN = null;

  function headers(extra) {
    var h = {
      'apikey': KEY,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    if (AUTH_TOKEN) {
      h['Authorization'] = 'Bearer ' + AUTH_TOKEN;
    } else {
      h['Authorization'] = 'Bearer ' + KEY;
    }
    return Object.assign(h, extra || {});
  }

  async function _fetch(path, opts) {
    var res = await fetch(URL + '/rest/v1/' + path, {
      method: opts.method || 'GET',
      headers: headers(opts.headers),
      body: opts.body
    });
    if (!res.ok) {
      var text = await res.text();
      throw new Error('Supabase ' + res.status + ': ' + text);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  window.__supabase = {
    get supabaseUrl() { return URL; },
    get supabaseKey() { return KEY; },

    setAuth: function(token) { AUTH_TOKEN = token; },
    clearAuth: function() { AUTH_TOKEN = null; },

    get: function(path, extra) {
      return _fetch(path, Object.assign({ method: 'GET' }, extra || {}));
    },
    getWithMeta: async function(path, extra) {
      var res = await fetch(URL + '/rest/v1/' + path, {
        method: 'GET',
        headers: headers(Object.assign({ 'Prefer': 'count=exact' }, (extra && extra.headers) || {}))
      });
      if (!res.ok) {
        var text = await res.text();
        throw new Error('Supabase ' + res.status + ': ' + text);
      }
      var data = res.status === 204 ? null : await res.json();
      var range = res.headers.get('content-range');
      var total = 0;
      if (range) {
        var match = range.match(/\/(\d+)$/);
        if (match) total = parseInt(match[1], 10);
      }
      return { data: data || [], total: total };
    },
    post: function(path, body) {
      return _fetch(path, {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
    },
    patch: function(path, body) {
      return _fetch(path, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
    },
    delete: function(path) {
      return _fetch(path, { method: 'DELETE' });
    }
  };
})();
