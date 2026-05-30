(function() {
  var URL = 'https://gxqcybboiskwznxdioun.supabase.co';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cWN5YmJvaXNrd3pueGRpb3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjcyNzcsImV4cCI6MjA5NTY0MzI3N30.5wt6GzJ0K80YoBCMlTIbqbF81yGZmaPFBhfoDbxI1Fc';

  async function _supaFetch(path, opts) {
    var res = await fetch(URL + '/rest/v1/' + path, {
      method: opts.method || 'GET',
      headers: Object.assign({
        'apikey': KEY,
        'Authorization': 'Bearer ' + KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, opts.headers || {}),
      body: opts.body
    });
    if (!res.ok) {
      var text = await res.text();
      throw new Error('Supabase ' + res.status + ': ' + text);
    }
    return res.json();
  }

  window.__supabase = {
    get supabaseUrl() { return URL; },
    get supabaseKey() { return KEY; },
    functionUrl: URL + '/functions/v1',
    get: function(path) {
      return _supaFetch(path, { method: 'GET' });
    },
    post: function(path, body) {
      return _supaFetch(path, {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify(body)
      });
    },
    rpc: function(nombre, params) {
      return fetch(URL + '/rest/v1/rpc/' + nombre, {
        method: 'POST',
        headers: {
          'apikey': KEY,
          'Authorization': 'Bearer ' + KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(params || {})
      }).then(function(res) {
        if (!res.ok) {
          return res.text().then(function(text) {
            throw new Error('Supabase RPC ' + res.status + ': ' + text);
          });
        }
        return res.json();
      });
    }
  };
})();
