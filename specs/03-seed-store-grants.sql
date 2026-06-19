-- ============================================================
-- 03-seed-store-grants.sql — Grants y RLS para guest checkout
-- Ejecutar DESPUES de 01-schema.sql (tablas deben existir)
-- Idempotente: usa IF NOT EXISTS en las policies
-- ============================================================

-- ============================================================
-- pos_clientes: SELECT + INSERT para anon
-- ============================================================
grant select, insert on public.pos_clientes to anon;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'anon crean clientes' and tablename = 'pos_clientes') then
    create policy "anon crean clientes"
      on public.pos_clientes for insert to anon with check (true);
  end if;
end $$;

-- ============================================================
-- st_direcciones: SELECT + INSERT para anon
-- ============================================================
grant select, insert on public.st_direcciones to anon;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'anon ven direcciones' and tablename = 'st_direcciones') then
    create policy "anon ven direcciones"
      on public.st_direcciones for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'anon crean direcciones' and tablename = 'st_direcciones') then
    create policy "anon crean direcciones"
      on public.st_direcciones for insert to anon with check (true);
  end if;
end $$;

-- ============================================================
-- st_pedidos: SELECT + INSERT para anon
-- ============================================================
grant select, insert on public.st_pedidos to anon;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'anon ven pedidos' and tablename = 'st_pedidos') then
    create policy "anon ven pedidos"
      on public.st_pedidos for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'anon crean pedidos' and tablename = 'st_pedidos') then
    create policy "anon crean pedidos"
      on public.st_pedidos for insert to anon with check (true);
  end if;
end $$;

-- ============================================================
-- st_pedidos_detalle: SELECT + INSERT para anon
-- ============================================================
grant select, insert on public.st_pedidos_detalle to anon;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'anon ven detalle de pedidos' and tablename = 'st_pedidos_detalle') then
    create policy "anon ven detalle de pedidos"
      on public.st_pedidos_detalle for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'anon crean detalle de pedidos' and tablename = 'st_pedidos_detalle') then
    create policy "anon crean detalle de pedidos"
      on public.st_pedidos_detalle for insert to anon with check (true);
  end if;
end $$;

-- ============================================================
-- NOTAS:
-- Las policies SELECT son necesarias porque PostgREST usa
-- Prefer: return=representation en POST, que hace un SELECT
-- implicito del registro insertado. Sin ellas, el INSERT
-- funciona pero la respuesta falla con 42501.
-- Se usa DO $$ ... END $$ con IF NOT EXISTS para que el
-- script sea idempotente (re-ejecutable sin errores).
-- ============================================================
