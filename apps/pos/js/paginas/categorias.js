(function () {
  'use strict';

  var CATEGORIAS = [];
  var EDITANDO_ID = null;
  var _guardando = false;

  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;

  async function init() {
    if (localStorage.getItem('darkMode') === 'true') html.classList.add('dark');
    window.KubitAuth.cargarSesion();
    if (!window.KubitAuth.obtenerUsuario()) { window.location.href = 'login.html'; return; }
    window.KubitAuth.aplicarRestriccionesUI();
    await cargarCategorias();
    bindearEventos();
  }

  async function cargarCategorias() {
    var res = await DB.categorias.listarTodas();
    if (res.error) { console.error('[Categorias] Error:', res.error); return; }
    CATEGORIAS = res.data || [];
    renderizarTabla(CATEGORIAS);
    poblarSelectPadre();
  }

  function poblarSelectPadre() {
    var sel = $('campo-padre');
    var actual = sel.value;
    sel.innerHTML = '<option value="">Ninguna (raíz)</option>';
    CATEGORIAS.forEach(function (c) {
      if (c.id === EDITANDO_ID) return;
      sel.innerHTML += '<option value="' + c.id + '">' + c.nombre + '</option>';
    });
    if (actual) sel.value = actual;
  }

  function renderizarTabla(lista) {
    var tbody = $('categorias-tbody');
    if (!lista.length) {
      tbody.innerHTML = '';
      $('categorias-empty').classList.remove('hidden');
      return;
    }
    $('categorias-empty').classList.add('hidden');
    tbody.innerHTML = lista.map(function (c) {
      var padre = c.categoria_padre_id ? (CATEGORIAS.find(function (x) { return x.id === c.categoria_padre_id; }) || {}).nombre || '—' : '—';
      var color = c.color || '#64748b';
      return '<tr class="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">' +
        '<td class="py-3 px-2"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background:' + color + '"></span><span class="text-sm font-medium text-slate-950 dark:text-white">' + c.nombre + '</span></div></td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">' + (c.codigo || '—') + '</td>' +
        '<td class="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">' + padre + '</td>' +
        '<td class="py-3 px-2 text-center"><span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + (c.activa !== false ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400') + '">' + (c.activa !== false ? 'Activa' : 'Inactiva') + '</span></td>' +
        '<td class="py-3 px-2 text-right"><div class="flex gap-1 justify-end">' +
        '<button class="btn-editar text-xs text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors px-2 py-1" data-id="' + c.id + '">Editar</button>' +
        '<button class="btn-eliminar text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1" data-id="' + c.id + '">Eliminar</button>' +
        '</div></td></tr>';
    }).join('');
  }

  function limpiarFormulario() {
    EDITANDO_ID = null;
    $('form-titulo').textContent = 'Nueva Categoría';
    $('form-categoria-id').textContent = '';
    $('campo-nombre').value = '';
    $('campo-codigo').value = '';
    $('campo-descripcion').value = '';
    $('campo-padre').value = '';
    $('campo-color').value = '#64748b';
    $('campo-color-texto').value = '#64748b';
    $('campo-activa').checked = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cargarEnForm(id) {
    var c = CATEGORIAS.find(function (x) { return x.id === id; });
    if (!c) return;
    EDITANDO_ID = id;
    $('form-titulo').textContent = 'Editar Categoría';
    $('form-categoria-id').textContent = c.nombre;
    $('campo-nombre').value = c.nombre;
    $('campo-codigo').value = c.codigo || '';
    $('campo-descripcion').value = c.descripcion || '';
    $('campo-padre').value = c.categoria_padre_id || '';
    $('campo-color').value = c.color || '#64748b';
    $('campo-color-texto').value = c.color || '#64748b';
    $('campo-activa').checked = c.activa !== false;
    poblarSelectPadre();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function guardar() {
    if (_guardando) return;
    var nombre = $('campo-nombre').value.trim();
    if (!nombre) { mostrarToast('El nombre es obligatorio'); return; }

    _guardando = true;
    $('btn-guardar').disabled = true;
    $('btn-guardar').textContent = 'Guardando...';

    try {
      var data = {
        nombre: nombre,
        codigo: $('campo-codigo').value.trim() || null,
        descripcion: $('campo-descripcion').value.trim() || null,
        color: $('campo-color').value || null,
        categoria_padre_id: $('campo-padre').value || null,
        activa: $('campo-activa').checked
      };

      var res;
      if (EDITANDO_ID) {
        res = await DB.categorias.actualizar(EDITANDO_ID, data);
        if (!res.error) mostrarToast('Categoría actualizada');
      } else {
        res = await DB.categorias.crear(data);
        if (!res.error) mostrarToast('Categoría creada');
      }

      if (res.error) { mostrarToast('Error: ' + res.error); _guardando = false; $('btn-guardar').disabled = false; $('btn-guardar').textContent = 'Guardar'; return; }

      limpiarFormulario();
      await cargarCategorias();
    } catch (e) {
      console.error('[Categorias] Error guardar:', e);
      mostrarToast('Error inesperado');
    }

    _guardando = false;
    $('btn-guardar').disabled = false;
    $('btn-guardar').textContent = 'Guardar';
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    var r = await DB.categorias.eliminar(id);
    if (r.error) { mostrarToast('Error: ' + r.error); return; }
    mostrarToast('Categoría eliminada');
    if (EDITANDO_ID === id) limpiarFormulario();
    await cargarCategorias();
  }

  function filtrar() {
    var q = $('buscador').value.toLowerCase().trim();
    var filtradas = CATEGORIAS.filter(function (c) {
      return c.nombre.toLowerCase().includes(q) || (c.codigo || '').toLowerCase().includes(q);
    });
    renderizarTabla(filtradas);
  }

  function mostrarToast(msg) {
    var el = $('toast');
    if (!el) {
      var t = document.createElement('div');
      t.id = 'toast';
      t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 opacity-0 translate-y-4 pointer-events-none';
      document.body.appendChild(t);
      el = t;
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 3000);
  }

  function bindearEventos() {
    $('btn-dark').addEventListener('click', function () {
      html.classList.toggle('dark');
      localStorage.setItem('darkMode', html.classList.contains('dark'));
    });

    $('btn-guardar').addEventListener('click', guardar);
    $('btn-limpiar-form').addEventListener('click', limpiarFormulario);
    $('buscador').addEventListener('input', filtrar);

    $('campo-color').addEventListener('input', function () {
      $('campo-color-texto').value = this.value;
    });
    $('campo-color-texto').addEventListener('input', function () {
      if (/^#[0-9a-f]{6}$/i.test(this.value)) $('campo-color').value = this.value;
    });

    $('categorias-tbody').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-editar')) cargarEnForm(btn.dataset.id);
      if (btn.classList.contains('btn-eliminar')) eliminar(btn.dataset.id);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
