(function () {
  var html = document.documentElement;
  var toggleBtn = document.getElementById('toggle-dark');
  var form = document.getElementById('form-login');
  var emailInput = document.getElementById('email');
  var passwordInput = document.getElementById('password');
  var cajaSelect = document.getElementById('caja');
  var errorEl = document.getElementById('login-error');
  var btnIngresar = document.getElementById('btn-ingresar');

  if (localStorage.getItem('darkMode') === 'true') {
    html.classList.add('dark');
  }

  // Cargar logo de empresa desde la configuracion
  (function () {
    var container = document.querySelector('.w-14.h-14.bg-slate-950.rounded-2xl');
    if (!container) return;
    DB.configuracionEmpresa.obtener().then(function (res) {
      if (res.data && res.data.logo_url) {
        var img = document.createElement('img');
        img.src = res.data.logo_url;
        img.alt = 'Logo';
        img.className = 'w-full h-full object-contain rounded-xl';
        img.onerror = function () {
          container.innerHTML = '<span class="text-white dark:text-slate-950 text-2xl font-bold">K</span>';
        };
        container.innerHTML = '';
        container.appendChild(img);
      }
    }).catch(function () {});
  })();

  // Mostrar mensaje si viene de sesion expirada
  var params = new URLSearchParams(window.location.search);
  if (params.get('expired') === '1') {
    errorEl.textContent = 'Tu sesion ha expirado. Inicia sesion de nuevo.';
    errorEl.classList.remove('hidden');
  }

  toggleBtn.addEventListener('click', function () {
    html.classList.toggle('dark');
    localStorage.setItem('darkMode', html.classList.contains('dark'));
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorEl.classList.add('hidden');

    var email = emailInput.value.trim();
    var password = passwordInput.value.trim();

    if (!email || !password) {
      errorEl.textContent = 'Email y contrasena son requeridos';
      errorEl.classList.remove('hidden');
      return;
    }

    if (!cajaSelect.value) {
      errorEl.textContent = 'Selecciona una caja';
      errorEl.classList.remove('hidden');
      return;
    }

    btnIngresar.disabled = true;
    btnIngresar.textContent = 'Ingresando...';

    var resultado = await window.KubitAuth.login(email, password);

    if (!resultado.exito) {
      errorEl.textContent = resultado.error;
      errorEl.classList.remove('hidden');
      btnIngresar.disabled = false;
      btnIngresar.textContent = 'Ingresar';
      return;
    }

    var cajaId = cajaSelect.value;
    var cajaNombre = cajaSelect.options[cajaSelect.selectedIndex].text;

    localStorage.setItem('pos_caja', cajaId);
    localStorage.setItem('pos_caja_nombre', cajaNombre);
    localStorage.setItem('pos_usuario', email);

    // Actualizar sesion con datos de caja y re-guardar
    var sesion = window.KubitAuth.obtenerUsuario();
    if (sesion) {
      sesion.cajaId = cajaId;
      sesion.cajaNombre = cajaNombre;
      localStorage.setItem('kubit_sesion', JSON.stringify(sesion));
    }

    window.location.href = 'ventas.html';
  });
})();
