document.addEventListener('DOMContentLoaded', function() {
  var items = obtenerCarritoCheckout();
  if (!items.length) {
    mostrarCarritoVacio();
    return;
  }
  renderizarResumen(items);
  document.querySelector('#resumen-pedido .bg-slate-950')?.addEventListener('click', function(e) {
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
  var resumen = document.querySelector('#resumen-pedido .space-y-2');
  if (resumen) {
    resumen.innerHTML = '\
      <p class="text-sm text-slate-400 text-center py-4">Agrega productos para ver el resumen</p>\
    ';
  }
  document.getElementById('checkout-total').textContent = '$0';
}

function renderizarResumen(items) {
  var html = '';
  var totalItems = 0;
  var totalSubtotal = 0;
  var costoEnvio = 9900;

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
  document.getElementById('checkout-total').textContent = formatearMoneda(totalSubtotal + costoEnvio);
}

function confirmarPedido(items) {
  var checkbox = document.querySelector('input[type="checkbox"]');
  if (checkbox && !checkbox.checked) {
    Modal({
      titulo: 'Acepta los términos',
      contenido: '<p class="text-sm text-slate-600">Debes aceptar los términos y condiciones para continuar.</p>'
    });
    return;
  }

  var totalItems = items.reduce(function(sum, item) { return sum + (item.cantidad || 1); }, 0);

  Modal({
    titulo: 'Pedido registrado',
    contenido: '\
      <div class="text-center py-2">\
        <svg class="w-14 h-14 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">\
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>\
        </svg>\
        <p class="text-sm text-slate-600 mb-1">Hemos recibido tu pedido de <strong>' + totalItems + ' ' + (totalItems === 1 ? 'producto' : 'productos') + '</strong>.</p>\
        <p class="text-sm text-slate-500 mb-5">Te enviaremos la confirmación a tu email.</p>\
        <a href="index.html" class="block w-full text-center px-4 py-2 text-sm font-medium bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors">Volver a la tienda</a>\
      </div>\
    ',
    onCerrar: function() {
      localStorage.removeItem('kubit_carrito');
      if (typeof actualizarBadgeCarrito === 'function') actualizarBadgeCarrito();
    }
  });
}
