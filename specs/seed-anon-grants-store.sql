-- Grants y RLS para guest checkout (checkout de tienda sin autenticacion)
-- Ejecutar en Supabase SQL Editor del proyecto QA

-- NOTA: Este archivo es la fuente de verdad para los permisos del guest checkout.
-- Si se ejecuta en un proyecto nuevo, debe correrse DESPUES de 02-database-schema.sql
-- para agregar los grants y policies que el schema base no incluye para rol anon.

-- ============================================================
-- pos_clientes: SELECT + INSERT para anon
-- ============================================================
grant select, insert on public.pos_clientes to anon;
create policy "anon crean clientes"
  on public.pos_clientes for insert to anon with check (true);

-- ============================================================
-- st_direcciones: SELECT + INSERT para anon
-- ============================================================
grant select, insert on public.st_direcciones to anon;
create policy "anon ven direcciones"
  on public.st_direcciones for select to anon using (true);
create policy "anon crean direcciones"
  on public.st_direcciones for insert to anon with check (true);

-- ============================================================
-- st_pedidos: SELECT + INSERT para anon
-- ============================================================
grant select, insert on public.st_pedidos to anon;
create policy "anon ven pedidos"
  on public.st_pedidos for select to anon using (true);
create policy "anon crean pedidos"
  on public.st_pedidos for insert to anon with check (true);

-- ============================================================
-- st_pedidos_detalle: SELECT + INSERT para anon
-- ============================================================
grant select, insert on public.st_pedidos_detalle to anon;
create policy "anon ven detalle de pedidos"
  on public.st_pedidos_detalle for select to anon using (true);
create policy "anon crean detalle de pedidos"
  on public.st_pedidos_detalle for insert to anon with check (true);

-- ============================================================
-- NOTAS:
-- Las policies SELECT son necesarias porque PostgREST usa
-- Prefer: return=representation en POST, que hace un SELECT
-- implicito del registro insertado. Sin ellas, el INSERT
-- funciona pero la respuesta falla con 42501.
-- ============================================================
