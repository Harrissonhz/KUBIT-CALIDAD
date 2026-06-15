(function () {
  'use strict';

  var dirHandle = null;
  var archivos = [];
  var START_DEFAULT = 1;

  function $(id) { return document.getElementById(id); }

  function init() {
    $('btn-select-folder').addEventListener('click', seleccionarCarpeta);
    $('btn-cancelar-preview').addEventListener('click', cancelarPreview);
    $('btn-ejecutar-renombre').addEventListener('click', ejecutarRenombrado);
    $('btn-reiniciar').addEventListener('click', reiniciar);
    $('input-start-number').addEventListener('input', function () {
      if (archivos.length > 0) generarVistaPrevia();
    });
  }

  async function seleccionarCarpeta() {
    try {
      if (!window.showDirectoryPicker) {
        mostrarToast('Tu navegador no soporta la File System Access API. Usa Google Chrome o Microsoft Edge.', 'error');
        return;
      }

      dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      archivos = [];

      for await (var entry of dirHandle.entries()) {
        var name = entry[0], handle = entry[1];
        if (handle.kind === 'file') {
          archivos.push({ name: name, handle: handle });
        }
      }

      archivos.sort(function (a, b) { return a.name.localeCompare(b.name, 'es', { numeric: true, sensitivity: 'base' }); });

      $('folder-name').textContent = dirHandle.name;
      $('file-count').textContent = archivos.length + ' archivo(s)';
      $('folder-info').classList.remove('hidden');

      $('card-resultados').classList.add('hidden');
      $('acciones-resultados').classList.add('hidden');
 
      if (archivos.length === 0) {
        mostrarToast('La carpeta seleccionada no contiene archivos.', 'error');
        $('card-preview').classList.add('hidden');
        return;
      }

      generarVistaPrevia();

    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        mostrarToast('Error al seleccionar la carpeta: ' + err.message, 'error');
      }
    }
  }

  function generarVistaPrevia() {
    var startNum = parseInt($('input-start-number').value) || START_DEFAULT;
    var totalFiles = archivos.length;
    var totalDigits = String(startNum + totalFiles - 1).length;

    var tbody = $('preview-body');
    tbody.innerHTML = '';

    archivos.forEach(function (archivo, index) {
      var currentNum = startNum + index;
      var paddedNum = String(currentNum).padStart(totalDigits, '0');
      var extension = obtenerExtension(archivo.name);
      var nuevoNombre = paddedNum + extension;

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="py-2.5 px-3 text-xs text-slate-500">' + (index + 1) + '</td>' +
        '<td class="py-2.5 px-3 text-sm text-slate-500 font-mono text-xs">' + escapeHTML(archivo.name) + '</td>' +
        '<td class="py-2.5 px-2 text-center text-slate-400 text-sm">→</td>' +
        '<td class="py-2.5 px-3 text-sm text-slate-950 dark:text-white font-semibold font-mono text-xs">' + escapeHTML(nuevoNombre) + '</td>';
      tbody.appendChild(tr);
    });

    $('card-preview').classList.remove('hidden');
    $('acciones-preview').classList.remove('hidden');
    $('action-bar').classList.remove('hidden');
  }

  async function ejecutarRenombrado() {
    if (!dirHandle || archivos.length === 0) return;

    var startNum = parseInt($('input-start-number').value) || START_DEFAULT;
    var totalFiles = archivos.length;
    var totalDigits = String(startNum + totalFiles - 1).length;

    var confirmado = confirm(
      'Estas seguro de que deseas renombrar ' + totalFiles + ' archivo(s)?\n\nEsta accion NO se puede deshacer.'
    );
    if (!confirmado) return;

    $('card-preview').classList.add('hidden');
    $('acciones-preview').classList.add('hidden');
    $('spinner').classList.remove('hidden');

    var contenidos = [];
    for (var i = 0; i < archivos.length; i++) {
      try {
        var file = await archivos[i].handle.getFile();
        var buffer = await file.arrayBuffer();
        var extension = obtenerExtension(archivos[i].name);
        var currentNum = startNum + i;
        var paddedNum = String(currentNum).padStart(totalDigits, '0');
        var nuevoNombre = paddedNum + extension;

        contenidos.push({
          index: i,
          oldName: archivos[i].name,
          newName: nuevoNombre,
          buffer: buffer,
          error: null
        });
      } catch (err) {
        contenidos.push({
          index: i,
          oldName: archivos[i].name,
          newName: '---',
          buffer: null,
          error: 'Error al leer: ' + err.message
        });
      }
    }

    for (var j = 0; j < contenidos.length; j++) {
      var item = contenidos[j];
      if (item.error) continue;
      try {
        await dirHandle.removeEntry(item.oldName);
      } catch (err) {
        item.error = 'Error al eliminar original: ' + err.message;
      }
    }

    var exitosos = 0;
    var errores = 0;
    for (var k = 0; k < contenidos.length; k++) {
      var it = contenidos[k];
      if (it.error) {
        errores++;
        continue;
      }
      try {
        var newFileHandle = await dirHandle.getFileHandle(it.newName, { create: true });
        var writable = await newFileHandle.createWritable();
        await writable.write(it.buffer);
        await writable.close();
        exitosos++;
      } catch (err) {
        it.error = 'Error al crear archivo: ' + err.message;
        errores++;
      }
    }

    $('spinner').classList.add('hidden');
    mostrarResultados(contenidos, exitosos, errores);
  }

  function mostrarResultados(resultados, exitosos, errores) {
    var tbody = $('results-body');
    tbody.innerHTML = '';

    resultados.forEach(function (item, index) {
      var tr = document.createElement('tr');
      var esError = item.error !== null;
      tr.innerHTML =
        '<td class="py-2 px-3 text-xs text-slate-500">' + (index + 1) + '</td>' +
        '<td class="py-2 px-3 text-sm text-slate-500 font-mono text-xs">' + escapeHTML(item.oldName) + '</td>' +
        '<td class="py-2 px-2 text-center text-slate-400 text-sm">→</td>' +
        '<td class="py-2 px-3 text-sm font-mono text-xs ' + (esError ? 'text-slate-400' : 'text-slate-950 dark:text-white font-semibold') + '">' + escapeHTML(item.newName) + '</td>' +
        '<td class="py-2 px-3 text-xs ' + (esError ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400') + '">' + (esError ? escapeHTML(item.error) : 'Listo') + '</td>';
      tbody.appendChild(tr);
    });

    var alertSuccess = $('alert-success');
    var alertError = $('alert-error');

    if (exitosos > 0) {
      alertSuccess.textContent = exitosos + ' archivo(s) renombrado(s) exitosamente.';
      alertSuccess.classList.remove('hidden');
    } else {
      alertSuccess.classList.add('hidden');
    }

    if (errores > 0) {
      alertError.textContent = errores + ' archivo(s) con errores.';
      alertError.classList.remove('hidden');
    } else {
      alertError.classList.add('hidden');
    }

    $('card-resultados').classList.remove('hidden');
    $('acciones-preview').classList.add('hidden');
    $('acciones-resultados').classList.remove('hidden');
  }

  function obtenerExtension(filename) {
    var dotIndex = filename.lastIndexOf('.');
    if (dotIndex === -1 || dotIndex === 0) return '';
    return filename.substring(dotIndex);
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function cancelarPreview() {
    $('card-preview').classList.add('hidden');
    $('acciones-preview').classList.add('hidden');
    $('action-bar').classList.add('hidden');
  }

  function reiniciar() {
    dirHandle = null;
    archivos = [];
    $('folder-info').classList.add('hidden');
    $('card-preview').classList.add('hidden');
    $('card-resultados').classList.add('hidden');
    $('alert-success').classList.add('hidden');
    $('alert-error').classList.add('hidden');
    $('acciones-preview').classList.add('hidden');
    $('acciones-resultados').classList.add('hidden');
    $('action-bar').classList.add('hidden');
    $('input-start-number').value = START_DEFAULT;
  }

  function mostrarToast(mensaje, tipo) {
    var toast = document.getElementById('toast');
    var msg = document.getElementById('toast-message');
    var icon = document.getElementById('toast-icon');
    if (!toast || !msg) return;

    msg.textContent = mensaje;
    if (icon) {
      icon.className = 'w-5 h-5 mt-0.5 shrink-0';
      if (tipo === 'error') {
        icon.innerHTML = '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>';
        icon.classList.remove('hidden');
      } else {
        icon.innerHTML = '<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
        icon.classList.remove('hidden');
      }
    }

    toast.classList.add('show');
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(function () { toast.classList.remove('show'); }, 3500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
