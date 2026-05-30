/**
 * supabase.js — Cliente Supabase (única instancia)
 * =================================================
 * Lee las credenciales desde config.js.
 * Todas las páginas del módulo POS importan supabase desde aquí.
 * No crear otro cliente Supabase en ningún otro archivo.
 */

if (typeof CONFIG === 'undefined') {
  console.error('[supabase.js] ERROR: No se encontró config.js. Copiar config.ejemplo.js a config.js y llenar las credenciales.');
}

const SUPABASE_URL = CONFIG?.supabaseUrl || 'https://FALTA_CONFIG.supabase.co';
const SUPABASE_ANON_KEY = CONFIG?.supabaseAnonKey || 'falta-config';

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = window.supabaseClient;
