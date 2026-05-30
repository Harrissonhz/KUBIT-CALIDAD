function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor ?? 0);
}

function formatearFecha(isoString) {
  return new Date(isoString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function obtenerParametroURL(nombre) {
  return new URLSearchParams(window.location.search).get(nombre);
}

function renderPrecio(producto) {
  const original = producto.precio_original;
  const actual = producto.precio;

  if (original && original > actual) {
    const descuento = Math.round((1 - actual / original) * 100);
    return `
      <span class="text-slate-400 line-through text-xs">${formatearMoneda(original)}</span>
      <span class="text-red-600 font-semibold ml-1">${formatearMoneda(actual)}</span>
      <span class="text-red-500 text-[10px] font-bold ml-1">-${descuento}%</span>
    `;
  }

  return `<span class="text-slate-400">${formatearMoneda(actual)}</span>`;
}
