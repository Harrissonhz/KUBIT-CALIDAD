function Modal(opciones) {
  const $div = document.createElement('div');
  $div.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70';
  $div.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-slate-900">${opciones.titulo}</h2>
        <button class="text-slate-400 hover:text-slate-600 text-xl leading-none" id="btn-cerrar-modal">&times;</button>
      </div>
      ${opciones.contenido}
    </div>
  `;
  $div.querySelector('#btn-cerrar-modal').onclick = () => {
    $div.remove();
    if (opciones.onCerrar) opciones.onCerrar();
  };
  $div.addEventListener('click', (e) => {
    if (e.target === $div) {
      $div.remove();
      if (opciones.onCerrar) opciones.onCerrar();
    }
  });
  document.body.appendChild($div);
  return $div;
}
