/**
 * config.js — Configuración de Supabase
 * ======================================
 * ATENCIÓN: Archivo subido TEMPORALMENTE para pruebas en servidor remoto.
 * En producción, excluir de Git (.gitignore).
 *
 * Soporta dos entornos: development (QA) y production.
 */

const ENTORNO = 'development'; // 'development' | 'production'

const CONFIG = {
  development: {
    supabaseUrl: 'https://gxqcybboiskwznxdioun.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cWN5YmJvaXNrd3pueGRpb3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjcyNzcsImV4cCI6MjA5NTY0MzI3N30.5wt6GzJ0K80YoBCMlTIbqbF81yGZmaPFBhfoDbxI1Fc'
  },
  production: {
    supabaseUrl: 'https://TU_PROYECTO_PROD.supabase.co',
    supabaseAnonKey: 'tu-anon-key-de-produccion'
  }
};

const SUPABASE_URL = CONFIG[ENTORNO].supabaseUrl;
const SUPABASE_ANON_KEY = CONFIG[ENTORNO].supabaseAnonKey;
