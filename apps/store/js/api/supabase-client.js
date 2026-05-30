(function() {
  var URL = 'https://gxqcybboiskwznxdioun.supabase.co';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cWN5YmJvaXNrd3pueGRpb3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjcyNzcsImV4cCI6MjA5NTY0MzI3N30.5wt6GzJ0K80YoBCMlTIbqbF81yGZmaPFBhfoDbxI1Fc';

  window.__supabase = {
    get: async function(path) {
      var res = await fetch(URL + '/rest/v1/' + path, {
        headers: {
          'apikey': KEY,
          'Authorization': 'Bearer ' + KEY,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        var text = await res.text();
        throw new Error('Supabase ' + res.status + ': ' + text);
      }
      return res.json();
    }
  };
})();
