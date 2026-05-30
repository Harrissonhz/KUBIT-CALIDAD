var COSTO_ENVIO = 9900;

document.addEventListener('DOMContentLoaded', function() {
  var items = obtenerCarritoCheckout();
  if (!items.length) {
    mostrarCarritoVacio();
    return;
  }
  renderizarResumen(items);
  document.getElementById('btn-confirmar-pedido').addEventListener('click', function(e) {
    e.preventDefault();
    confirmarPedido(items);
  });
});

function obtenerCarritoCheckout() {
  try {
    return JSON.parse(localStorage.getItem('kubit_carrito') || '[]');
  } catch (e) {
    return [];
  }
}

function mostrarCarritoVacio() {
  document.getElementById('checkout-items').innerHTML = '\
    <div class="text-center py-8">\
      <p class="text-slate-500 text-sm mb-2">No hay productos en tu carrito</p>\
      <a href="index.html" class="inline-block mt-2 text-sm text-slate-950 underline">Ir a la tienda</a>\
    </div>\
  ';
  document.getElementById('checkout-cantidad').textContent = '0';
  document.getElementById('checkout-subtotal').textContent = '$0';
  document.getElementById('checkout-total').textContent = '$0';
  document.getElementById('btn-confirmar-pedido').disabled = true;
}

function renderizarResumen(items) {
  var html = '';
  var totalItems = 0;
  var totalSubtotal = 0;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var cant = item.cantidad || 1;
    var precio = item.precio || 0;
    var subtotal = cant * precio;
    totalItems += cant;
    totalSubtotal += subtotal;

    html += '\
      <div class="flex items-center gap-3">\
        <div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">\
          <img src="' + (item.imagen || '') + '" alt="' + (item.nombre || '') + '" class="w-full h-full object-cover">\
        </div>\
        <div class="flex-1 min-w-0">\
          <p class="text-sm text-slate-900 truncate">' + (item.nombre || 'Producto') + '</p>\
          <p class="text-xs text-slate-400">' + cant + ' × ' + formatearMoneda(precio) + '</p>\
        </div>\
        <p class="text-sm font-medium text-slate-900">' + formatearMoneda(subtotal) + '</p>\
      </div>\
    ';
  }

  document.getElementById('checkout-items').innerHTML = html;
  document.getElementById('checkout-cantidad').textContent = totalItems;
  document.getElementById('checkout-subtotal').textContent = formatearMoneda(totalSubtotal);
  document.getElementById('checkout-total').textContent = formatearMoneda(totalSubtotal + COSTO_ENVIO);
}

function leerFormulario() {
  return {
    nombre: document.getElementById('checkout-nombre').value.trim(),
    email: document.getElementById('checkout-email').value.trim(),
    telefono: document.getElementById('checkout-telefono').value.trim(),
    direccion: document.getElementById('checkout-direccion').value.trim(),
    ciudad: document.getElementById('checkout-ciudad').value,
    departamento: document.getElementById('checkout-departamento').value
  };
}

function obtenerMetodoPago() {
  var seleccionado = document.querySelector('input[name="pago"]:checked');
  return seleccionado ? seleccionado.value : null;
}

function validarFormulario(data) {
  var errores = [];
  if (!data.nombre) errores.push('Nombre completo');
  if (!data.email) errores.push('Email');
  if (!data.telefono) errores.push('Teléfono');
  if (!data.direccion) errores.push('Dirección');
  if (!data.ciudad) errores.push('Ciudad');
  if (!data.departamento) errores.push('Departamento');
  return errores;
}

function mostrarEstadoCargando(activo) {
  var btn = document.getElementById('btn-confirmar-pedido');
  var texto = document.getElementById('btn-confirmar-texto');
  var spinner = document.getElementById('btn-confirmar-spinner');
  if (activo) {
    btn.disabled = true;
    texto.textContent = 'Procesando...';
    spinner.classList.remove('hidden');
  } else {
    btn.disabled = false;
    texto.textContent = 'Confirmar pedido';
    spinner.classList.add('hidden');
  }
}

async function confirmarPedido(items) {
  var terminos = document.getElementById('checkout-terminos');
  if (terminos && !terminos.checked) {
    Modal({
      titulo: 'Acepta los términos',
      contenido: '<p class="text-sm text-slate-600">Debes aceptar los términos y condiciones para continuar.</p>'
    });
    return;
  }

  var data = leerFormulario();
  var errores = validarFormulario(data);

  if (errores.length > 0) {
    Modal({
      titulo: 'Campos obligatorios',
      contenido: '\
        <p class="text-sm text-slate-600 mb-3">Completa los siguientes campos:</p>\
        <ul class="text-sm text-red-500 space-y-1">\
          ' + errores.map(function(e) { return '<li>• ' + e + '</li>'; }).join('') + '\
        </ul>\
      '
    });
    return;
  }

  var metodoPago = obtenerMetodoPago();
  if (!metodoPago) {
    Modal({
      titulo: 'Método de pago',
      contenido: '<p class="text-sm text-slate-600">Selecciona un método de pago para continuar.</p>'
    });
    return;
  }

  mostrarEstadoCargando(true);

  var totalItems = items.reduce(function(sum, item) { return sum + (item.cantidad || 1); }, 0);

  var FUNCTION_URL = 'https://gxqcybboiskwznxdioun.supabase.co/functions/v1/create-pedido';

  try {
    var res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: items,
        cliente: {
          nombre: data.nombre,
          email: data.email,
          telefono: data.telefono
        },
        direccion: {
          direccion: data.direccion,
          ciudad: data.ciudad,
          departamento: data.departamento
        },
        metodoPago: metodoPago
      })
    });

    if (!res.ok) {
      var errBody = await res.text();
      var errMsg = errBody;
      try { errMsg = JSON.parse(errBody).error || errBody; } catch (_) {}
      throw new Error(errMsg);
    }

    var result = await res.json();

    localStorage.removeItem('kubit_carrito');
    if (typeof actualizarBadgeCarrito === 'function') actualizarBadgeCarrito();

    mostrarEstadoCargando(false);

    Modal({
      titulo: 'Pedido registrado',
      contenido: '\
        <div class="text-center py-2">\
          <svg class="w-14 h-14 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">\
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>\
          </svg>\
          <p class="text-sm text-slate-600 mb-1">¡Pedido <strong>#' + result.numero_pedido + '</strong> registrado!</p>\
          <p class="text-sm text-slate-600 mb-1">Hemos recibido tu pedido de <strong>' + result.total_items + ' ' + (result.total_items === 1 ? 'producto' : 'productos') + '</strong>.</p>\
          <p class="text-sm text-slate-500 mb-5">Te enviaremos la confirmación a <strong>' + result.email + '</strong>.</p>\
          <a href="index.html" class="block w-full text-center px-4 py-2 text-sm font-medium bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors">Volver a la tienda</a>\
        </div>\
      '
    });

  } catch (err) {
    console.error('Error al crear pedido:', err);
    mostrarEstadoCargando(false);

    Modal({
      titulo: 'No se pudo procesar',
      contenido: '\
        <div class="text-center py-2">\
          <svg class="w-14 h-14 mx-auto text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">\
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>\
          </svg>\
          <p class="text-sm text-slate-600 mb-1">Ocurrió un error al registrar tu pedido.</p>\
          <p class="text-xs text-slate-400 mb-5">Detalle: ' + err.message + '</p>\
          <button class="block w-full text-center px-4 py-2 text-sm font-medium bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors" onclick="this.closest(\'.fixed\').remove()">Intentar de nuevo</button>\
        </div>\
      '
    });
  }
}
