/* ============================================================
   setup.js — Setup global de mocks para tests
   ============================================================
   Se ejecuta antes de cada archivo de test (configurado en
   vitest.config.js > setupFiles).
   Crea los mocks de window.* que el codigo fuente espera.
   ============================================================ */

import { vi, beforeEach } from 'vitest';

// ─── Mock de window ──────────────────────────────────────────
globalThis.window = globalThis;

// ─── Mock de localStorage ────────────────────────────────────
var mockStore = {};
globalThis.localStorage = {
  getItem: function (key) { return mockStore[key] ?? null; },
  setItem: function (key, val) { mockStore[key] = String(val); },
  removeItem: function (key) { delete mockStore[key]; },
  clear: function () { mockStore = {}; },
  get _store() { return mockStore; }
};

// ─── Mock de CONFIG (imitando config.js) ─────────────────────
globalThis.CONFIG = {
  supabaseUrl: 'https://test-project.supabase.co',
  supabaseAnonKey: 'test-anon-key-12345'
};
globalThis.SUPABASE_URL = globalThis.CONFIG.supabaseUrl;
globalThis.SUPABASE_ANON_KEY = globalThis.CONFIG.supabaseAnonKey;

// ─── Mock de window.__supabase (imitando supabase.js) ────────
globalThis.__supabase = {
  get: vi.fn(),
  getWithMeta: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  rpc: vi.fn(),
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
  get supabaseUrl() { return CONFIG.supabaseUrl; },
  get supabaseKey() { return CONFIG.supabaseAnonKey; }
};

// ─── Mock de window.KubitAuth (imitando auth.js) ─────────────
globalThis.KubitAuth = {
  login: vi.fn(),
  logout: vi.fn(),
  cargarSesion: vi.fn(),
  tienePermiso: vi.fn()
};

// ─── Mock de console (silenciar errores esperados en tests) ──
globalThis.console = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn()
};

// ─── Mock de document.querySelector para logo en database.js ─
if (!globalThis.document.querySelector) {
  globalThis.document.querySelector = vi.fn(function () { return null; });
}
if (!globalThis.document.querySelectorAll) {
  globalThis.document.querySelectorAll = vi.fn(function () { return []; });
}

// ─── Reset automatico entre tests ────────────────────────────
beforeEach(function () {
  vi.clearAllMocks();
  mockStore = {};
  // Nota: DB._cache es privado dentro del IIFE de database.js
  // Para limpiar cache de DB, usar operaciones que lo invaliden
  // (mutaciones como crear/actualizar/eliminar) o recargar el modulo
});
