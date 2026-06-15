(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }

  function toggleSidebar() {
    var sidebar = $('sidebar');
    var overlay = $('sidebar-overlay');
    if (!sidebar || !overlay) return;
    var abierto = sidebar.classList.contains('translate-x-0');
    if (abierto) {
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    } else {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
      overlay.classList.remove('hidden');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btnMenu = $('btn-menu');
    var btnCerrar = $('btn-cerrar-menu');
    var overlay = $('sidebar-overlay');
    if (btnMenu) btnMenu.addEventListener('click', toggleSidebar);
    if (btnCerrar) btnCerrar.addEventListener('click', toggleSidebar);
    if (overlay) overlay.addEventListener('click', toggleSidebar);
  });
})();
