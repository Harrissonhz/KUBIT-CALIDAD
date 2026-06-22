# Especificacion de Migracion de Datos V1 → V2

## 1. Vision General

Documento que define el proceso de migracion de datos desde el sistema V1 (archivos CSV exportados) hacia V2 (esquema PostgreSQL en Supabase produccion).

**Origen:** `ArchivosInformativos/Basedatos/` — 14 archivos CSV exportados del sistema V1.

**Destino:** Proyecto Supabase produccion con 35 tablas (esquema `public`, prefijos `pos_*` y `st_*`).

**Scripts de migracion:** `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/` — scripts INSERT por tabla, con transformaciones explicitas cuando son necesarias.

---

## 2. Convenciones de Scripts

### 2.1 Nomenclatura

```
NN-migrate-<tabla>.sql
```

Donde `NN` es un numero secuencial de dos digitos que refleja el **orden de ejecucion** requerido por las dependencias de FK.

### 2.2 Estructura de cada script

```sql
-- ============================================================
-- NN-migrate-<tabla>.sql
-- Descripcion breve
-- Orden requerido: <tablas que deben migrarse antes>
-- ============================================================
-- Notas sobre transformaciones o datos problematicos
-- ============================================================

insert into public.<tabla> (...) values
(...),
(...);
```

### 2.3 Reglas generales

1. Los UUIDs originales de V1 se **preservan** en todos los scripts para mantener trazabilidad con registros relacionados (ventas, pedidos, movimientos de inventario).
2. Las columnas `created_by` / `updated_by` se migran solo si el UUID referenciado existe en `pos_usuarios`. Si estan vacias en V1, se insertan como NULL.
3. `deleted_at` se migra tal cual (NULL si no hay soft-delete).
4. `created_at` / `updated_at` se migran con los valores originales de V1, no con `default now()`.
5. Toda transformacion de datos (division por 100, reasignacion de columnas, limpieza) debe estar documentada en el script como comentario.

---

## 3. Orden de Migracion

Dependencias de FK entre tablas:

```
01. pos_usuarios                ← Referenciado por casi todas las tablas (created_by/updated_by)
02. pos_gasto_categorias        ← Sin dependencias externas
03. pos_categorias              ← Sin dependencias externas
04. pos_proveedores             ← Sin dependencias externas
05. pos_configuracion_empresa   ← FK a pos_usuarios (updated_by)
06. pos_finanzas_mensuales      ← Sin dependencias externas
07. pos_clientes                ← Sin dependencias externas
08. pos_gastos_mensuales_detalle ← FK a pos_gasto_categorias, pos_usuarios, pos_ventas (diferido)
```

**Nota:** Las tablas de Fase 2 (pos_productos, pos_productos_detalle, pos_productos_multimedia) se migraron en una etapa separada usando CSV + JSON como fuente dual. Las tablas de Fase 3 (pos_ventas, pos_ventas_detalle, pos_compras, pos_compras_detalle, pos_movimientos_inventario) migran despues.

### Fase 2 — Productos (09-09c)
```
09.  pos_productos + pos_productos_detalle    ← 128 productos fisicos desde CSV
09b. pos_productos_multimedia                 ← 110 descripciones + 1178 multimedia desde JSON
09c. pos_productos + detalle + multimedia     ← 196 productos digitales desde JSON (UUIDs deterministicos)
```

### Fase 3 — Ventas, Compras, Movimientos (10-12, 08b)
```
10.  pos_ventas + pos_ventas_detalle          ← 300 ventas + 318 detalle desde CSV
11.  pos_compras + pos_compras_detalle        ← 42 compras + 96 detalle desde CSV
12.  pos_movimientos_inventario               ← 446 movimientos desde CSV
08b. UPDATE pos_gastos_mensuales_detalle       ← Religar venta_id (298 pares)
```

---

## 4. Analisis Campo a Campo

### 4.1 pos_usuarios

| # | V1 (origen) | V2 (destino) | Tipo V2 | Compatible |
|---|---|---|---|---|
| 1 | `id` | `id` | `uuid PK` | ✅ Directo |
| 2 | `nombre_completo` | `nombre_completo` | `text NOT NULL` | ✅ Directo |
| 3 | `usuario` | `usuario` | `text` | ✅ Directo |
| 4 | `email` | `email` | `text NOT NULL` | ✅ Directo |
| 5 | `telefono` | `telefono` | `text` | ✅ Directo |
| 6 | `documento` | `documento` | `text` | ✅ Directo |
| 7 | `fecha_nacimiento` | `fecha_nacimiento` | `date` | ✅ Directo |
| 8 | `direccion` | `direccion` | `text` | ✅ Directo |
| 9 | `rol` | `rol` | `text` | ✅ Directo |
| 10 | `permisos` | `permisos` | `jsonb` | ✅ Directo |
| 11 | `activo` | `activo` | `boolean` | ✅ Directo |
| 12 | `ultimo_acceso` | `ultimo_acceso` | `timestamptz` | ✅ Directo |
| 13 | `password_hash` | `password_hash` | `text` | ✅ Directo |
| 14 | `created_at` | `created_at` | `timestamptz` | ✅ Directo |
| 15 | `updated_at` | `updated_at` | `timestamptz` | ✅ Directo |
| 16 | `created_by` | `created_by` | `uuid FK` | ✅ Vacio → NULL |
| 17 | `updated_by` | `updated_by` | `uuid FK` | ✅ Vacio → NULL |
| 18 | `deleted_at` | `deleted_at` | `timestamptz` | ✅ Directo |

**Problemas:** Ninguno. 2 registros. El UUID `497a2c95-d707-4d5b-8b01-34257f3b0224` (admin) debe preservarse porque es referenciado por otras tablas.

### 4.2 pos_gasto_categorias

| # | V1 (origen) | V2 (destino) | Tipo V2 | Compatible |
|---|---|---|---|---|
| 1-9 | Todos los campos | `id`...`deleted_at` | — | ✅ **100% compatible** |

**Problemas:** Ninguno. 23 registros. `created_by`/`updated_by` vacios → NULL.

### 4.3 pos_categorias

| # | V1 (origen) | V2 (destino) | Tipo V2 | Compatible |
|---|---|---|---|---|
| 1-12 | Todos los campos | `id`...`categoria_padre_id` | — | ✅ **100% compatible** |

**Problemas:** Ninguno. 11 registros. `created_by`/`updated_by` vacios → NULL.

### 4.4 pos_proveedores

| # | V1 (origen) | V2 (destino) | Tipo V2 | Compatible |
|---|---|---|---|---|
| 1-23 | Todos los campos | `id`...`deleted_at` | — | ✅ **100% compatible** |

**Problemas:** Ninguno. 5 registros. `created_by`/`updated_by` vacios → NULL. Algunos proveedores tienen `departamento` vacio (ej: Washington, Irlanda) → V2 acepta NULL.

### 4.5 pos_configuracion_empresa

| # | V1 (origen) | V2 (destino) | Tipo V2 | Compatible |
|---|---|---|---|---|
| 1 | `id` | `id` | `uuid PK` | ✅ Directo |
| 2 | `nombre_empresa` | `nombre_empresa` | `text NOT NULL` | ✅ Directo |
| 3 | `nit` | `nit` | `text NOT NULL` | ✅ Directo |
| 4 | `direccion` | `direccion` | `text` | ✅ Directo |
| 5 | `telefono` | `telefono` | `text` | ✅ Directo |
| 6 | `email` | `email` | `text` | ✅ Directo |
| 7 | `sitio_web` | `sitio_web` | `text` | ✅ Directo |
| 8 | `resolucion_dian` | `resolucion_dian` | `text NOT NULL` | ✅ Directo |
| 9 | `rango_desde` | `rango_desde` | `int` | ✅ Directo |
| 10 | `rango_hasta` | `rango_hasta` | `int` | ✅ Directo |
| 11 | `impuesto_default = 19.00` | `impuesto_default` | `numeric` | ⚠️ **Dividir /100 → 0.19** |
| 12 | `moneda` | `moneda` | `text default 'COP'` | ✅ Directo |
| 13 | `zona_horaria` | `zona_horaria` | `text default 'America/Bogota'` | ✅ Directo |
| 14 | `created_at` | `created_at` | `timestamptz` | ✅ Directo |
| 15 | `updated_at` | `updated_at` | `timestamptz` | ✅ Directo |
| 16 | — | `created_by` | `uuid FK` | ✅ No existe en V1 → NULL |
| 17 | `updated_by = 497a2c95-...` | `updated_by` | `uuid FK` | ⚠️ Requiere UUID admin en `pos_usuarios` |
| 18 | `fecha_vencimiento_resolucion` | `fecha_vencimiento_resolucion` | `date` | ✅ Directo |
| 19 | `prefijo_facturacion` | `prefijo_facturacion` | `text` | ✅ Directo |
| 20 | `logo_url` | `logo_url` | `text` | ✅ Directo |
| 21 | `mensaje_legal` | `mensaje_legal` | `text` | ✅ Directo |
| 22 | — | `store_url` | `text` | ✅ No existe en V1 → NULL |
| 23 | — | `deleted_at` | `timestamptz` | ✅ No existe en V1 → NULL |

**Problemas:**
- `impuesto_default` = 19.00 → debe dividirse /100 para V2 (decimal 0.19)
- `updated_by` = `497a2c95-...` → requiere que el admin exista en `pos_usuarios` con ese UUID

### 4.6 pos_finanzas_mensuales

| # | V1 (origen) | V2 (destino) | Tipo V2 | Compatible |
|---|---|---|---|---|
| 1-21 | `id`...`compras_total` | `id`...`compras_total` | — | ✅ **100% compatible** |
| — | No existe en V1 | `costos_comision_total` | `numeric default 0` | ✅ Default 0 |

**Problemas:** Ninguno. 34 registros financieros. `created_by`/`updated_by` vacios → NULL. Columna extra `costos_comision_total` usa default `0`.

### 4.7 pos_clientes

| # | V1 (origen) | V2 (destino) | Tipo V2 | Compatible |
|---|---|---|---|---|
| 1 | `id` | `id` | `uuid PK` | ✅ Directo |
| 2 | `tipo_id` | `tipo_id` | `text NOT NULL` | ✅ Directo |
| 3 | `numero_id` | `numero_id` | `text NOT NULL` | ✅ Directo |
| 4 | `nombre_completo` | ❌ No existe en V2 | — | 🟡 Se ignora (V1 ya tiene campos separados) |
| 5 | `primer_nombre` | `primer_nombre` | `text NOT NULL` | ✅ Directo |
| 6 | `segundo_nombre` | `segundo_nombre` | `text` | ✅ Directo |
| 7 | `primer_apellido` | `primer_apellido` | `text NOT NULL` | ✅ Directo |
| 8 | `segundo_apellido` | `segundo_apellido` | `text` | ✅ Directo |
| 9 | `direccion` | `direccion` | `text` | ✅ Directo |
| 10 | `ciudad` | `ciudad` | `text` | ✅ Directo |
| 11 | `departamento` | `departamento` | `text` | ✅ Directo |
| 12 | `telefono` | `telefono` | `text` | ✅ Directo |
| 13 | `celular` | `celular` | `text` | ✅ Directo |
| 14 | `email` | `email` | `text` | ✅ Directo |
| 15 | `fecha_nacimiento` | `fecha_nacimiento` | `date` | ✅ Directo |
| 16 | `genero` | `genero` | `text` | ✅ Directo |
| 17 | `activo` | `activo` | `boolean default true` | ✅ Directo |
| 18 | `notas` | `notas` | `text` | ✅ Directo |
| 19 | `created_at` | `created_at` | `timestamptz` | ✅ Directo |
| 20 | `updated_at` | `updated_at` | `timestamptz` | ✅ Directo |
| 21 | `created_by` | `created_by` | `uuid FK` | ✅ Vacio → NULL |
| 22 | `updated_by` | `updated_by` | `uuid FK` | ✅ Vacio → NULL |
| 23 | `deleted_at` | `deleted_at` | `timestamptz` | ✅ Directo |

**Problemas:**
- `nombre_completo` de V1 se descarta (V2 usa campos separados `primer_nombre`, `primer_apellido`, etc.)
- Fila `21760f85`: `primer_apellido = 'Medellin'` es la ciudad, no un apellido. Se migra tal cual de V1 por decision del usuario.

### 4.8 pos_gastos_mensuales_detalle

| # | V1 (origen) | V2 (destino) | Tipo V2 | Compatible |
|---|---|---|---|---|
| 1 | `id` | `id` | `uuid PK` | ✅ Directo |
| 2 | `anio` | `anio` | `int NOT NULL` | ✅ Directo |
| 3 | `mes` | `mes` | `int NOT NULL` | ✅ Directo |
| 4 | `categoria_id` | `categoria_id` | `uuid FK NOT NULL` | ✅ Directo |
| 5 | `monto` | `monto` | `numeric` | ✅ Directo |
| 6 | `notas` | `notas` | `text` | ✅ Directo |
| 7 | `created_at` | `created_at` | `timestamptz` | ✅ Directo |
| 8 | `updated_at` | `updated_at` | `timestamptz` | ✅ Directo |
| 9 | `created_by = 497a2c95-...` | `created_by` | `uuid FK` | ⚠️ Requiere UUID admin en `pos_usuarios` |
| 10 | `updated_by = 497a2c95-...` | `updated_by` | `uuid FK` | ⚠️ Requiere UUID admin en `pos_usuarios` |
| 11 | `deleted_at` | `deleted_at` | `timestamptz` | ✅ Directo |
| 12 | `venta_id` | `venta_id` | `uuid FK → pos_ventas` | 🟡 Se deja NULL (ventas no migradas) |

**Problemas:**
- **306 de 413 filas** tienen `created_by`/`updated_by` = `497a2c95-...` → requiere que el admin exista en `pos_usuarios` con ese UUID
- `venta_id` = NULL (migracion de ventas es Fase 3, pendiente de definir)

---

## 5. Transformaciones Requeridas

| Tabla | Campo | Transformacion |
|---|---|---|
| `pos_configuracion_empresa` | `impuesto_default` | `19.00 → 0.19` (dividir /100) |

---

## 6. Datos Problematicos Detectados

| Tabla | UUID | Problema | Decision |
|---|---|---|---|
| `pos_clientes` | `21760f85` | `primer_apellido = "Medellin"` (es ciudad, no apellido). Nota: "Estudiante del CENSA en la sede Medellin La Playa" | Migrar tal cual V1. No corregir. |
| Varias tablas | `497a2c95-...` | UUID del admin V1 referenciado como FK en `configuracion_empresa.updated_by` y `gastos_mensuales_detalle.created_by/updated_by` | Migrar `pos_usuarios` PRIMERO preservando este UUID |

---

## 7. Checklist de Ejecucion

### Fase 1 — Core
- [x] 01. Ejecutar `01-migrate-usuarios.sql` (2 registros, preserva UUID admin)
- [x] 02. Ejecutar `02-migrate-gasto-categorias.sql` (23 registros)
- [x] 03. Ejecutar `03-migrate-categorias.sql` (11 registros)
- [x] 04. Ejecutar `04-migrate-proveedores.sql` (5 registros)
- [x] 05. Ejecutar `05-migrate-configuracion-empresa.sql` (1 registro, transformacion /100)
- [x] 06. Ejecutar `06-migrate-finanzas-mensuales.sql` (34 registros)
- [x] 07. Ejecutar `07-migrate-clientes.sql` (5 registros)
- [x] 08. Ejecutar `08-migrate-gastos-mensuales-detalle.sql` (413 registros, venta_id = NULL)

### Fase 2 — Productos
- [x] 09. Ejecutar `09-migrate-productos-pos.sql` (128 productos fisicos, preserve UUIDs V1)
- [x] 09b. Ejecutar `09b-update-store-data.sql` (110 descripciones + 1178 multimedia)
- [x] 09c. Ejecutar `09c-migrate-productos-digitales.sql` (196 productos digitales, UUIDs deterministicos v5)
- [x] Actualizar precio_venta de productos digitales: `UPDATE pos_productos_detalle SET precio_venta = 5000 WHERE precio_venta = 0 AND producto_id IN (SELECT id FROM pos_productos WHERE tipo_producto = 'Digital')`

### Fase 3 — Ventas, Compras, Movimientos
- [x] 10. Ejecutar `10-migrate-ventas.sql` (300 ventas + 318 detalle, canal MercadoLibre, metodo Transferencia)
- [x] 11. Ejecutar `11-migrate-compras.sql` (42 compras + 96 detalle)
- [x] 12. Ejecutar `12-migrate-movimientos.sql` (446 movimientos de inventario)
- [x] 08b. Ejecutar `08b-relink-ventas-gastos.sql` (religar 298 pares gasto-venta)
- [ ] Verificar integridad referencial en Supabase: `select * from information_schema.table_constraints where constraint_type = 'FOREIGN KEY'`
- [ ] Verificar conteo de filas en cada tabla destino vs CSV origen
- [ ] Probar login en produccion con admin@kubit.com
- [ ] Verificar que 10 productos de 09 tienen `activo=false` (confirmar si es correcto)
- [ ] Asignar tags a productos en DB para poblar carrusel y badges del Store

---

## 8. Referencias

- `ArchivosInformativos/Basedatos/` — CSV de origen (14 archivos)
- `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/` — Scripts INSERT
- `specs/01-schema.sql` — DDL destino
- `specs/02-seed-permisos.sql` — Seed de roles y permisos
- `specs/03-seed-store-grants.sql` — Grants anon para Store
- `specs/01-master-spec.md` — Mapa de artefactos del proyecto
