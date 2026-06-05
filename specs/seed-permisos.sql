-- ============================================================
-- seed-permisos.sql
-- Datos semilla para el sistema de roles y permisos del POS Kubit
-- Ejecutar en el SQL Editor de Supabase (QA / Produccion)
-- ============================================================

-- 1. Roles base
insert into public.pos_roles (nombre, descripcion) values
  ('Administrador', 'Acceso total al sistema. Ve todas las pantallas y funciones.'),
  ('Vendedor', 'Acceso a ventas y caja. No ve compras, clientes ni administracion.')
on conflict (nombre) do nothing;

-- 2. Permisos del sistema
insert into public.pos_permisos (clave, descripcion, modulo) values
  ('pos.ventas.*',         'Acceso completo a ventas (registrar, historial, facturacion)', 'POS'),
  ('pos.inventario.*',     'Acceso completo a inventario (productos, categorias, stock)', 'POS'),
  ('pos.compras.*',        'Acceso completo a compras y proveedores', 'POS'),
  ('pos.clientes.*',       'Acceso completo a clientes', 'POS'),
  ('pos.caja.*',           'Acceso completo a caja y finanzas', 'POS'),
  ('pos.finanzas.*',       'Acceso a gastos y reportes', 'POS'),
  ('pos.caja.apertura',    'Permiso para abrir caja', 'POS'),
  ('pos.caja.cierre',      'Permiso para cerrar caja', 'POS'),
  ('pos.caja.cierre_forzado', 'Permiso para cierre forzado de caja', 'POS')
on conflict (clave) do nothing;

-- 3. Vincular Administrador a TODOS los permisos
insert into public.pos_rol_permisos (rol_id, permiso_id)
select r.id, p.id from public.pos_roles r, public.pos_permisos p
where r.nombre = 'Administrador'
on conflict do nothing;

-- 4. Vincular Vendedor a permisos basicos
insert into public.pos_rol_permisos (rol_id, permiso_id)
select r.id, p.id from public.pos_roles r, public.pos_permisos p
where r.nombre = 'Vendedor'
  and p.clave in ('pos.ventas.*', 'pos.caja.*', 'pos.caja.apertura', 'pos.caja.cierre')
on conflict do nothing;
