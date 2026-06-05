-- ============================================================
-- seed-permisos.sql
-- Datos semilla para el sistema de roles y permisos del POS Kubit
-- Ejecutar en el SQL Editor de Supabase (QA / Produccion)
--
-- NOTA: Las tablas pos_roles y pos_permisos NO tienen
--       constraint UNIQUE en nombre/clave, por eso se usa
--       WHERE NOT EXISTS en vez de ON CONFLICT.
-- ============================================================

-- 1. Roles base
insert into public.pos_roles (nombre, descripcion)
select 'Administrador', 'Acceso total al sistema. Ve todas las pantallas y funciones.'
where not exists (select 1 from public.pos_roles where nombre = 'Administrador');

insert into public.pos_roles (nombre, descripcion)
select 'Vendedor', 'Acceso a ventas y caja. No ve compras, clientes ni administracion.'
where not exists (select 1 from public.pos_roles where nombre = 'Vendedor');

-- 2. Permisos del sistema
insert into public.pos_permisos (clave, descripcion, modulo)
select 'pos.ventas.*', 'Acceso completo a ventas (registrar, historial, facturacion)', 'POS'
where not exists (select 1 from public.pos_permisos where clave = 'pos.ventas.*');

insert into public.pos_permisos (clave, descripcion, modulo)
select 'pos.inventario.*', 'Acceso completo a inventario (productos, categorias, stock)', 'POS'
where not exists (select 1 from public.pos_permisos where clave = 'pos.inventario.*');

insert into public.pos_permisos (clave, descripcion, modulo)
select 'pos.compras.*', 'Acceso completo a compras y proveedores', 'POS'
where not exists (select 1 from public.pos_permisos where clave = 'pos.compras.*');

insert into public.pos_permisos (clave, descripcion, modulo)
select 'pos.clientes.*', 'Acceso completo a clientes', 'POS'
where not exists (select 1 from public.pos_permisos where clave = 'pos.clientes.*');

insert into public.pos_permisos (clave, descripcion, modulo)
select 'pos.caja.*', 'Acceso completo a caja y finanzas', 'POS'
where not exists (select 1 from public.pos_permisos where clave = 'pos.caja.*');

insert into public.pos_permisos (clave, descripcion, modulo)
select 'pos.finanzas.*', 'Acceso a gastos y reportes', 'POS'
where not exists (select 1 from public.pos_permisos where clave = 'pos.finanzas.*');

insert into public.pos_permisos (clave, descripcion, modulo)
select 'pos.caja.apertura', 'Permiso para abrir caja', 'POS'
where not exists (select 1 from public.pos_permisos where clave = 'pos.caja.apertura');

insert into public.pos_permisos (clave, descripcion, modulo)
select 'pos.caja.cierre', 'Permiso para cerrar caja', 'POS'
where not exists (select 1 from public.pos_permisos where clave = 'pos.caja.cierre');

insert into public.pos_permisos (clave, descripcion, modulo)
select 'pos.caja.cierre_forzado', 'Permiso para cierre forzado de caja', 'POS'
where not exists (select 1 from public.pos_permisos where clave = 'pos.caja.cierre_forzado');

-- 3. Vincular Administrador a TODOS los permisos
insert into public.pos_rol_permisos (rol_id, permiso_id)
select r.id, p.id from public.pos_roles r, public.pos_permisos p
where r.nombre = 'Administrador'
  and not exists (
    select 1 from public.pos_rol_permisos rp
    where rp.rol_id = r.id and rp.permiso_id = p.id
  );

-- 4. Vincular Vendedor a permisos basicos
insert into public.pos_rol_permisos (rol_id, permiso_id)
select r.id, p.id from public.pos_roles r, public.pos_permisos p
where r.nombre = 'Vendedor'
  and p.clave in ('pos.ventas.*', 'pos.caja.*', 'pos.caja.apertura', 'pos.caja.cierre')
  and not exists (
    select 1 from public.pos_rol_permisos rp
    where rp.rol_id = r.id and rp.permiso_id = p.id
  );
