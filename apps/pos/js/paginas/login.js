(function () {
  var html = document.documentElement;
  var toggleBtn = document.getElementById('toggle-dark');
  var form = document.getElementById('form-login');
  var usuario = document.getElementById('usuario');
  var password = document.getElementById('password');
  var caja = document.getElementById('caja');
  var errorEl = document.getElementById('login-error');
  var btnIngresar = document.getElementById('btn-ingresar');

  if (localStorage.getItem('darkMode') === 'true') {
    html.classList.add('dark');
  }

  toggleBtn.addEventListener('click', function () {
    html.classList.toggle('dark');
    localStorage.setItem('darkMode', html.classList.contains('dark'));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorEl.classList.add('hidden');

    var user = usuario.value.trim();
    var pass = password.value.trim();

    if (!user || !pass) {
      errorEl.textContent = 'Usuario y contraseña son requeridos';
      errorEl.classList.remove('hidden');
      return;
    }

    if (!caja.value) {
      errorEl.textContent = 'Selecciona una caja';
      errorEl.classList.remove('hidden');
      return;
    }

    btnIngresar.disabled = true;
    btnIngresar.textContent = 'Ingresando...';

    var cajaNombre = caja.options[caja.selectedIndex].text;
    var sesion = window.KubitAuth.login(user, pass, caja.value, cajaNombre);

    if (!sesion) {
      errorEl.textContent = 'Usuario o contraseña incorrectos';
      errorEl.classList.remove('hidden');
      btnIngresar.disabled = false;
      btnIngresar.textContent = 'Ingresar';
      return;
    }

    localStorage.setItem('pos_caja', caja.value);
    localStorage.setItem('pos_caja_nombre', cajaNombre);
    localStorage.setItem('pos_usuario', user);

    window.location.href = 'ventas.html';
  });
})();