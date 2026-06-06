/* ============================================================
   auth.test.js — Tests de autenticacion y permisos
   ============================================================
   Cubre:
     - tienePermiso() con admin bypass
     - tienePermiso() con wildcards
     - tienePermiso() para cajero sin permisos
     - requierePermiso()
   ============================================================ */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach, vi } from 'vitest';

var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);

// Cargar auth.js real
var authCode = readFileSync(
  resolve(__dirname, '../../apps/pos/js/compartido/auth.js'),
  'utf-8'
);

// Mock de document.getElementById para soportar poblarUserHeader()
var mockElements = {};
globalThis.document.getElementById = function (id) {
  if (!mockElements[id]) {
    mockElements[id] = { textContent: '' };
  }
  return mockElements[id];
};

// Mock de window.location (lo necesita manejarErrorAuth)
delete globalThis.window.location;
globalThis.window.location = { href: '', pathname: '/ventas.html' };

function recargarAuth() {
  delete globalThis.KubitAuth;
  // Resetear USUARIO_ACTUAL ejecutando el codigo de auth
  // El codigo llama cargarSesion() automaticamente al cargar
  // Necesitamos que localStorage devuelva null para que no haya sesion
  eval(authCode);
  return globalThis.KubitAuth;
}

describe('KubitAuth.tienePermiso', function () {
  var Auth;

  beforeEach(function () {
    vi.clearAllMocks();
    mockElements = {};
    // Resetear el modulo auth creando un entorno limpio
    // Forzar que cargarSesion no encuentre sesion
    localStorage.removeItem('kubit_sesion');
    Auth = recargarAuth();
  });

  it('retorna false si no hay usuario activo', function () {
    expect(Auth.tienePermiso('pos.venta.crear')).toBe(false);
  });

  it('retorna true para Administrador sin importar el permiso', function () {
    var fakeUser = {
      id: 'admin-1',
      nombre: 'Admin',
      email: 'admin@test.com',
      rolNombre: 'Administrador',
      permisos: [],
      accessToken: 'fake-token'
    };
    localStorage.setItem('kubit_sesion', JSON.stringify(fakeUser));
    Auth = recargarAuth();

    expect(Auth.tienePermiso('pos.venta.crear')).toBe(true);
    expect(Auth.tienePermiso('pos.configuracion.ver')).toBe(true);
    expect(Auth.tienePermiso('cualquier.cosita')).toBe(true);
  });

  it('retorna true si el permiso exacto esta en la lista', function () {
    var fakeUser = {
      id: 'cajero-1',
      nombre: 'Cajero',
      email: 'cajero@test.com',
      rolNombre: 'Cajero',
      permisos: ['pos.venta.crear', 'pos.caja.abrir'],
      accessToken: 'fake-token'
    };
    localStorage.setItem('kubit_sesion', JSON.stringify(fakeUser));
    Auth = recargarAuth();

    expect(Auth.tienePermiso('pos.venta.crear')).toBe(true);
    expect(Auth.tienePermiso('pos.caja.abrir')).toBe(true);
  });

  it('retorna false si el permiso no esta en la lista del cajero', function () {
    var fakeUser = {
      id: 'cajero-1',
      nombre: 'Cajero',
      email: 'cajero@test.com',
      rolNombre: 'Cajero',
      permisos: ['pos.venta.crear'],
      accessToken: 'fake-token'
    };
    localStorage.setItem('kubit_sesion', JSON.stringify(fakeUser));
    Auth = recargarAuth();

    expect(Auth.tienePermiso('pos.configuracion.ver')).toBe(false);
    expect(Auth.tienePermiso('pos.finanzas.*')).toBe(false);
  });

  it('matchea wildcard de sub-modulo (pos.venta.* cubre pos.venta.crear)', function () {
    var fakeUser = {
      id: 'cajero-2',
      nombre: 'Cajero',
      email: 'cajero@test.com',
      rolNombre: 'Cajero',
      permisos: ['pos.venta.*'],
      accessToken: 'fake-token'
    };
    localStorage.setItem('kubit_sesion', JSON.stringify(fakeUser));
    Auth = recargarAuth();

    expect(Auth.tienePermiso('pos.venta.crear')).toBe(true);
    expect(Auth.tienePermiso('pos.venta.ver')).toBe(true);
    expect(Auth.tienePermiso('pos.caja.abrir')).toBe(false);
  });

  it('matchea wildcard de modulo (pos.* cubre cualquier permiso POS)', function () {
    var fakeUser = {
      id: 'admin-lite',
      nombre: 'Admin Lite',
      email: 'adminl@test.com',
      rolNombre: 'Supervisor',
      permisos: ['pos.*'],
      accessToken: 'fake-token'
    };
    localStorage.setItem('kubit_sesion', JSON.stringify(fakeUser));
    Auth = recargarAuth();

    expect(Auth.tienePermiso('pos.configuracion.ver')).toBe(true);
    expect(Auth.tienePermiso('pos.venta.crear')).toBe(true);
    expect(Auth.tienePermiso('store.productos.ver')).toBe(false);
  });
});

describe('KubitAuth.requierePermiso', function () {
  var Auth;

  beforeEach(function () {
    vi.clearAllMocks();
    mockElements = {};
    // Mock del toast
    mockElements.toast = { textContent: '', classList: { add: vi.fn(), remove: vi.fn() }, _timer: null };
    localStorage.removeItem('kubit_sesion');
    Auth = recargarAuth();
  });

  it('retorna true y no muestra error si tiene permiso', function () {
    var fakeUser = {
      id: 'admin-1',
      nombre: 'Admin',
      email: 'admin@test.com',
      rolNombre: 'Administrador',
      permisos: [],
      accessToken: 'fake-token'
    };
    localStorage.setItem('kubit_sesion', JSON.stringify(fakeUser));
    Auth = recargarAuth();

    expect(Auth.requierePermiso('pos.venta.crear')).toBe(true);
  });

  it('retorna false si no tiene permiso', function () {
    var fakeUser = {
      id: 'cajero-1',
      nombre: 'Cajero',
      email: 'cajero@test.com',
      rolNombre: 'Cajero',
      permisos: ['pos.venta.crear'],
      accessToken: 'fake-token'
    };
    localStorage.setItem('kubit_sesion', JSON.stringify(fakeUser));
    Auth = recargarAuth();

    expect(Auth.requierePermiso('pos.configuracion.ver')).toBe(false);
  });
});
