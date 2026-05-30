/**
 * config.ejemplo.js — Template de configuración
 * ===============================================
 * 1. Copiar este archivo a config.js en la misma carpeta
 * 2. Reemplazar los valores placeholder con las credenciales reales
 * 3. NUNCA subir config.js a GitHub (está en .gitignore)
 *
 * Soporta dos entornos: development y production.
 * Cambiar ENTORNO según donde se esté desplegando.
 */

const ENTORNO = 'development'; // 'development' | 'production'

const CONFIG = {
  development: {
    supabaseUrl: 'https://TU_PROYECTO_DEV.supabase.co',
    supabaseAnonKey: 'tu-anon-key-de-desarrollo',
  },
  production: {
    supabaseUrl: 'https://TU_PROYECTO_PROD.supabase.co',
    supabaseAnonKey: 'tu-anon-key-de-produccion',
  }
};

// ============================================
// NO MODIFICAR DE AQUÍ EN ADELANTE
// ============================================
const SUPABASE_URL = CONFIG[ENTORNO].supabaseUrl;
const SUPABASE_ANON_KEY = CONFIG[ENTORNO].supabaseAnonKey;
