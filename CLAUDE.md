# AGENTS.md — Memoria Persistente del Proyecto Kubit

Este archivo es la **memoria oficial del proyecto** para cualquier IA que trabaje en el ecosistema Kubit. Contiene las reglas, el stack, las decisiones ya tomadas y el estado actual del desarrollo. Leerlo completo antes de cualquier intervención.

---

## 1. Reglas para la IA (No Alucinar)

### 1.1 Cero Suposiciones
- Ante cualquier duda o especificación faltante, la IA debe **PREGUNTAR al usuario**. Nunca inventar lógica, estructuras, tecnologías, relaciones, nombres de archivos, endpoints o decisiones de diseño.
- Si una especificación no existe en `/specs/`, no se asume. Se consulta.

### 1.2 No Asumir Pago
- Todo el diseño debe funcionar **en los planes gratuitos de Supabase** (500 MB DB, 1 GB Storage, 50K MAUs, 5 GB egress, 500K Edge Functions).
- No se deben implementar funcionalidades que requieran add-ons de pago (Image Transformations, PITR, Custom Domains, etc.) sin consultar al usuario.
- El hosting es en **Vercel (plan gratuito)**.
- No se usan servicios de pago externos sin autorización explícita.

### 1.3 Responsive Obligatorio
- Todo el código generado debe ser **responsive (mobile-first, mínimo 360px)**.
- Seguir estrictamente las clases Tailwind definidas en `05-ui-ux-system.md`.
- No se aceptan diseños que no funcionen en pantallas táctiles.

### 1.4 Sin Commits Automaticos a GitHub
- La IA **NUNCA debe hacer `git commit` ni `git push`** a menos que el usuario lo solicite explícitamente con instrucciones como "commitea", "haz commit", "sincroniza", "pushea" o similar.
- Todos los cambios se mantienen en el working directory hasta que el usuario decida sincronizar.
- Esta regla aplica a cualquier repositorio, branch o entorno.

---

## 2. Stack Tecnológico (Confirmado)

| Capa | Tecnología |
|---|---|
| **Frontend** | HTML semántico + Tailwind CSS (vía CDN) + JavaScript vanilla. Sin frameworks SPA (React, Vue, Angular) |
| **Backend/Database** | PostgreSQL 15+ vía Supabase (plan gratuito). Cliente `supabase-js` directamente. Sin ORMs |
| **API** | Supabase Data API (PostgREST) + Edge Functions para lógica compleja. Sin servidor propio |
| **Auth** | Supabase Auth (email/password + magic link). Sin Auth0, Clerk ni otros |
| **Multimedia** | Las URLs de imágenes/archivos se almacenan en DB. El contenido se aloja en un repositorio separado de GitHub, no en Supabase Storage |
| **Hosting** | Vercel (plan gratuito) |
| **PWA** | `manifest.json` + `service-worker.js` para instalación en dispositivos |
| **Repositorio** | GitHub |

---

## 3. Arquitectura del Proyecto

### 3.1 Estructura de Directorios
```
/
├── AGENTS.md              ← Memoria de IA (universal)
├── CLAUDE.md              ← Copia de AGENTS.md (compatibilidad Claude Code)
├── CONTEXT.md             ← Glosario de dominio del proyecto
├── README.md
├── specs/                 ← Fuente de verdad (Spec-Driven Development)
│   ├── 01-master-spec.md
│   ├── 02-database-schema.sql
│   ├── 03-pos-spec.md
│   ├── 04-store-spec.md
│   ├── 05-ui-ux-system.md
│   ├── 10-codex.md        ← Pendiente
│   ├── 11-api-contracts.md ← Pendiente
│   ├── 12-roadmap.md       ← Pendiente
│   └── ARCHITECTURE.md
├── ArchivosInformativos/ ← Información externa (no parte del proyecto)
│   ├── Basedatos/               ← CSVs de origen V1 (14 tablas)
│   ├── DespliegueProduccion/    ← Credenciales produccion, guias de despliegue
│   │   └── ScriptMigracionDB/   ← Scripts INSERT ordenados para migracion V1→V2
├── apps/
│   ├── pos/               ← Código del módulo POS
│   ├── store/             ← Código del módulo Tienda Virtual
│   └── academy/           ← Futuro (post-MVP)
│
├── .opencode/skills/      ← Skills para OpenCode
│   ├── supabase-postgres-best-practices/
│   ├── frontend-design/
│   ├── improve-codebase-architecture/
│   ├── tdd/
│   ├── requesting-code-review/
│   ├── deploy-to-vercel/
│   ├── kubit-pos/
│   ├── kubit-store/
│   ├── kubit-codex/
│   └── kubit-ui/
│
└── .claude/skills/        ← Skills para Claude Code (mismos que .opencode)
    └── ...
```

### 3.2 Base de Datos
- **Esquema único:** `public` (default de Supabase)
- **Prefijo de tablas:**
  - `pos_*` → Módulo POS + tablas core compartidas (25 tablas)
  - `st_*` → Módulo Store (10 tablas)
  - `academy_*` → Módulo Academy (futuro)
- Los módulos comparten tablas base: `pos_productos`, `pos_productos_detalle`, `pos_categorias`, `pos_clientes`, `pos_usuarios`, `pos_roles`, `pos_permisos`, `pos_configuracion_empresa`, `pos_metodos_pago`, `pos_canales_venta`
- **35 tablas en total** (25 pos_* + 10 st_*)

### 3.3 Licenciamiento
- El SaaS se puede vender **por módulos separados** (POS solo, Store solo, o bundle)
- Un cliente puede comprar un módulo y luego agregar el otro sin migración de datos
- El módulo Academy se agregará post-MVP sin impacto en las tablas existentes

---

## 4. Skills de IA Disponibles

El proyecto incluye skills especializadas en `.opencode/skills/` y `.claude/skills/` para potenciar a la IA. Se cargan automáticamente según el contexto de la tarea.

### 4.1 Skills Públicas (del ecosistema)

| Skill | Propósito | Instalaciones |
|---|---|---|
| `supabase-postgres-best-practices` | Optimización de queries, esquemas y RLS en PostgreSQL/Supabase | 188.4K |
| `frontend-design` | Creación de interfaces frontend con diseño distintivo y profesional | 456.9K |
| `improve-codebase-architecture` | Identificar oportunidades de refactorización y mejorar la arquitectura | 164K |
| `tdd` | Desarrollo guiado por pruebas (red-green-refactor) | 157K |
| `requesting-code-review` | Solicitar revisión de código a un subagente especializado | 98.7K |
| `deploy-to-vercel` | Desplegar aplicaciones a Vercel (preview y producción) | 57.3K |

### 4.2 Skills Custom (proyecto Kubit)

| Skill | Base Spec | Contenido |
|---|---|---|
| `kubit-pos` | `03-pos-spec.md` | Reglas de negocio del POS (ventas, caja, inventario, DIAN) |
| `kubit-store` | `04-store-spec.md` | Reglas de negocio de la Tienda Virtual (catálogo, carrito, pedidos) |
| `kubit-codex` | `10-codex.md` | Convenciones de código (nombres, estructura, dependencias) |
| `kubit-ui` | `05-ui-ux-system.md` | Sistema de diseño UI/UX (paleta Slate, responsive, PWA) |

---

## 5. Decisiones de Diseño ya Tomadas (No Reabrir)

| Decisión | Valor |
|---|---|
| Primary Key | UUID v4 (`gen_random_uuid()`) |
| Timestamps | `timestamptz` con `default now()` |
| `updated_at` | Automático vía trigger `update_updated_at()` |
| Soft Delete | `deleted_at` nullable (`timestamptz`) |
| Estados | CHECK constraints con strings (sin ENUMs PostgreSQL) |
| RLS | Habilitado en todas las tablas con políticas por rol |
| Grants | Explícitos por tabla (`anon`, `authenticated`, `service_role`) |
| Índices | Todas las FK deben tener índice |
| Diseño UI | Ultra-minimalista, monocromático Slate (Tailwind) |
| Responsive | Mobile-first, mínimo 360px |
| Navegación | Sin frameworks SPA. HTML vanilla con navegación tradicional o Alpine.js ligero si es necesario |
| Editar ventas confirmadas | NO permitido edicion directa. Usar **Void + Recreate**: crear la nueva venta PRIMERO, solo si exito anular la original (orden invertido para mitigar perdida de datos). Metodo `DB.ventas.anularConRevertir()` revierte stock + finanzas. sessionStorage + query param `?editar=ID` para transferencia de datos. Boton "Editar" en modal de ventas-historial. |
| Header POS | `fixed top-0 left-0 right-0 z-30` en todas las páginas. El contenido tiene `pt-16` para compensar |
| Modo oscuro por defecto | Todas las páginas cargan con `class="dark"` en `<html>`. Anti-flash script: si localStorage dice `'false'` lo remueve |
| Sección de usuario en header | Centralizada en `auth.js::poblarUserHeader()`. Solo requiere los IDs `user-avatar`, `user-name`, `user-rol` en el HTML |
| IVA siempre visible | `tasa_impuesto` está fuera del toggle single/multi-variante, visible siempre |
| Multi-variante | Las variantes se guardan como N registros en `pos_productos_detalle` con `atributos jsonb`. Edición inline con filas expandibles (▼) |
| POS PWA service worker | Rutas relativas (`service-worker.js`) para compatibilidad local y Vercel. Precarga assets (HTML, JS, CSS, imágenes). Cache-first con fallback network. |
| Tags de producto (chips) | 6 chips toggle en vez de input texto libre. `data-tag` en minúsculas estrictas. Almacenados como `text[]` en `pos_productos.tags`. Los valores deben coincidir EXACTAMENTE con `badgeMap` del Store. |
| Ciudad checkout Store | `<datalist>` filtrado por departamento desde `colombia.js` para reducir errores de escritura y garantizar consistencia con datos reales. |
| Canales dinamicos POS | `pos_canales_venta.tipo` agrupa canales en `fisico`, `web_propio` o `marketplace`. Los marketplaces se renderizan dinamicamente desde DB en `<select>`. Costos visibles solo si `tipo === 'marketplace'`. |
| Service Worker fetch handler | Usar `fetch(e.request, { redirect: 'follow' })` + verificar `!r.redirected` en cache. Necesario porque `npx serve` puede responder con redirecciones que rompen `e.respondWith()` en requests de navegacion. |
| Sidebar label unificado | "Inventario" renombrado a "Stock" en las 16 paginas POS para coincidir con la terminologia del modulo. |
| SW auto-reload via postMessage | Al activarse el SW (`activate`), envia `{accion:'recargar'}` a todos los clients via `clients.matchAll()` + `postMessage()`. Cada pagina HTML escucha `message` en `navigator.serviceWorker` y ejecuta `location.reload()`. El usuario siempre ve la version mas reciente del SW sin recarga manual. |
| SW localhost bypass | Si `self.location.hostname === 'localhost'` o `'127.0.0.1'`, el SW hace `return;` sin `e.respondWith()` en fetch, y omite precache en install/activate. Asi `npx serve` funciona sin interferencia del SW. |
| SW cache versioning YYYYMMDD-NN | El nombre del cache usa formato `kubit-pos-YYYYMMDD-NN` (POS) y `outletshop-YYYYMMDD-NN` (Store). `YYYYMMDD` = fecha del deploy, `NN` = contador por dia (01, 02...). Cada deploy produce un cache nuevo; el SW elimina caches viejos en `activate`. |
| SW ignoreSearch:true | En `caches.match(e.request, {ignoreSearch:true})` para que `producto.html` (sin query) sirva para requests a `producto.html?slug=...`. Cache-first funciona correctamente en paginas de producto. |
| SW .catch() en fetch handler | El fetch handler del SW envuelve la promesa en `.catch(() => fetch(e.request))` para evitar el error "A listener indicated an asynchronous response by returning true" cuando el cache falla o hay redirecciones. |
| npx http-server para local en Windows | `npx serve` en Windows 10 hace redirect 301 de `GET /producto.html?slug=...` → `GET /producto` (pierde query params). Usar `npx http-server apps/store -p 3000` o XAMPP como alternativa local. Este bug no tiene fix desde el codigo del proyecto. |
| Herramientas module structure | `apps/pos/herramientas/` subdirectorio independiente con hub → sub-page navigation. El hub (`herramientas.html`) muestra card grid, cada card navega a `herramientas/<tool>.html`. Sin modals ni tabs. |
| Action buttons outside cards | En herramientas y paginas CRUD, los botones de accion (Cancelar, Confirmar, etc.) van en natural flow fuera de los `<details>` cards, usando `flex flex-col sm:flex-row gap-3`. No usan `position: fixed`. Se muestran/ocultan contextualmente via JS (clase `hidden`). |
| Sidebar toggle extraido | `js/compartido/sidebar.js` contiene la funcion `toggleSidebar()` compartida para paginas que no pertenecen a los 14 CRUD principales (herramientas.html, herramientas/renombrar-archivos.html). Las 14 paginas principales mantienen el toggle inline. |
| Card visibility: `hidden` class vs inline `style` | Para elementos que JS oculta/muestra, usar SIEMPRE `class="hidden"` (Tailwind), NUNCA `style="display:none"`. `classList.remove('hidden')` no funciona con inline `style` por mayor especificidad CSS. |
| No data-permiso en Herramientas | El grupo Herramientas en el sidebar no tiene `data-permiso` — es visible para todos los usuarios autenticados sin control de permisos. |
| Migracion V1→V2: ScriptMigracionDB | Los scripts INSERT de migracion residen en `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/` con nomenclatura `NN-migrate-<tabla>.sql` donde NN = orden de ejecucion por FK. NO estan en `specs/` por ser material externo de migracion. |
| Migracion: Preservar UUIDs V1 | Todos los scripts de migracion preservan los UUIDs originales de V1 para mantener trazabilidad con registros relacionados (ventas, pedidos, movimientos de inventario). |
| Migracion: Datos corruptos V1 | La fila `21760f85` en `pos_clientes` tiene `primer_apellido = 'Medellin'` (es ciudad, no apellido). Se migra tal cual de V1 por decision del usuario. No corregir. |
| Migracion: impuesto_default /100 | `configuracion_empresa.impuesto_default = 19.00` en V1 debe dividirse entre 100 para V2 (decimal 0.19). La transformacion se documenta en el script. |
| Migracion: Orden por FK | El orden de migracion sigue las dependencias de FK: primero `pos_usuarios` (preserva UUID admin `497a2c95-...`), luego tablas sin dependencias, y finalmente tablas que referencian al admin. |
| Migracion Fase 3: canal_id hardcodeado | Todas las ventas de V1 usaban canal fisico pero el usuario decidio migrarlas como canal MercadoLibre con UUID `b9acdc2e-323a-4687-81be-5e0a8f579103`. |
| Migracion Fase 3: metodo_pago hardcodeado | V1 usaba `efectivo` pero el usuario decidio migrar como `Transferencia` para todas las ventas. |
| Migracion Fase 3: producto_detalle_id via subquery | Scripts 09 y 09c preservan UUIDs V1 como `pos_productos.id`. `pos_productos_detalle.producto_id` es FK directa. El mapping se resuelve con subquery `(SELECT pd.id FROM pos_productos_detalle pd WHERE pd.producto_id = d.producto_id::uuid LIMIT 1)`. |
| Migracion Fase 3: INSERT...SELECT con casts | Los scripts 10, 11, 12 usan `INSERT INTO ... SELECT ... FROM (VALUES ...)`. Todas las columnas UUID y timestamptz requieren cast explicito (`::uuid`, `::timestamptz`) porque Postgres no hace coercion implicita de texto a estos tipos en una proyeccion SELECT. |
| Migracion Fase 3: 08b sin temp table | `08b-relink-ventas-gastos.sql` se regenero con CTE `WITH gasto_venta_map (gasto_id, venta_id) AS (VALUES ...)` usando los 298 pares hardcodeados. Ya no depende de la tabla temporal `_v1_gasto_venta_map` (que era session-scoped y se perdia). |

---

## 6. Límites del Plan Gratuito de Supabase

| Recurso | Límite |
|---|---|
| Base de datos | 500 MB total (NO hay límite de filas por tabla) |
| File Storage | 1 GB (no aplica porque las URLs son externas) |
| MAUs (Auth) | 50,000 mensuales |
| Egress | 5 GB/mes |
| Edge Functions | 500,000 invocaciones/mes |
| Realtime | 200 conexiones concurrentes, 2M mensajes/mes |
| Proyectos activos | 2 |
| Pausa por inactividad | 1 semana (usar GitHub Actions con ping cada 3 días para evitarlo) |
| Backups automáticos | No incluidos |
| Log retention | 1 día |

---

## 7. Estado Actual del Proyecto

### 7.1 Completado (Specs)
- [x] `01-master-spec.md` — Visión general, reglas del SaaS, mapa de artefactos
- [x] `02-database-schema.sql` — DDL completo (35 tablas con grants, RLS, índices, triggers)
- [x] `03-pos-spec.md` — Especificación completa del módulo POS
- [x] `04-store-spec.md` — Especificación completa del módulo Store
- [x] `05-ui-ux-system.md` — Sistema de diseño UI/UX (Tailwind, colores, responsive, PWA)
- [x] `06-servicio-correo.md` — Especificacion simplificada de correo transaccional con Resend (POST-MVP, no implementar en v1)
- [x] `ARCHITECTURE.md` — Estructura de directorios
- [x] `AGENTS.md` — Memoria persistente (este archivo)
- [x] `CONTEXT.md` — Glosario de dominio del proyecto

### 7.2 Completado (Implementación)

#### Módulo Store (Tienda Virtual)
- [x] `supabase-client.js` — Cliente `fetch()` directo a REST API Supabase (sin supabase-js)
- [x] `productos.js` — API de productos con caché 30s, mapper DB→objeto plano
- [x] `categorias.js` — API de categorías con caché 60s + promos fijas
- [x] `inicio.js` — Async carousel + menú categorías
- [x] `producto.js` — Async detalle producto + relacionados
- [x] Todas las páginas migradas: `data.js` → `supabase-client.js`
- [x] `MigracionProductos.sql` — DML generado automáticamente (100 productos, 1158 INSERTs total: 100 pos_productos + 100 detalle + 958 multimedia)
- [x] `checkout.js` — Guest checkout: crea pedidos via REST API directa (`__supabase.post()`) con 7 operaciones secuenciales (canal Web, cliente, dirección, pedido, detalle). Sin Edge Functions
- [x] **Favicon SVG**: `<link rel="icon" type="image/svg+xml" href="img/icon.svg">` agregado en las 8 páginas HTML
- [x] **Navbar fixed**: `navbar-store.js` cambiado de `sticky` a `fixed top-0 left-0 right-0 z-50 w-full` para que el navbar (logo, búsqueda, redes, carrito) permanezca visible al scrollear en todas las páginas. `pt-14` agregado al `<main>` wrapper para compensar altura.
- [x] **icon2.svg**: Nuevo archivo de icono minimalista (bolsa/tienda) para uso futuro
- [x] **Badges Store**: `card-producto.js` corregido: badge `mas_vendido` (guion bajo), nuevos badges `nuevo` (azul) e `imperdible` (purpura), grupo `oferta` para oferta/super-oferta/remate
- [x] **Checkout UX**: Departamento/Ciudad intercambiados, ciudad con `<datalist>` filtrado por departamento desde `colombia.js`
- [x] **Scrollbar visible**: Menu categorias desktop ahora muestra scrollbar horizontal (`overflow-x-auto`)
- [x] **Factura-print Store**: Columna "Impuesto" agregada con `d.impuesto || 0`

#### Módulo POS (Punto de Venta) — Fase 1: Auth Real
- [x] `config.js` — Configuración multi-entorno (QA/Prod) con credenciales Supabase
- [x] `supabase.js` — Cliente `fetch()` raw a REST API Supabase con auth token
- [x] `auth.js` — Autenticación real contra Supabase Auth REST API (login/logout/sesión/permisos)
- [x] `login.html` + `login.js` — Login con email/password real, selección de caja, sesión persistente

#### Módulo POS (Punto de Venta) — Fase 2: DatabaseService
- [x] `database.js` — CRUD genérico (select/insert/update/softDelete) con caché, paginación y búsqueda
- [x] Métodos entity-specific: `DB.productos`, `DB.categorias`, `DB.clientes`, `DB.ventas`, `DB.cajas`, `DB.cajaApertura`, `DB.metodosPago`, `DB.canalesVenta`
- [x] Script tag `database.js` agregado en `login.html`, `ventas.html`, `caja.html` (entre supabase.js y auth.js)

#### Módulo POS (Punto de Venta) — Fase 3: Ventas Reales
- [x] `ventas.js` reescrito: init async con carga de datos desde Supabase
- [x] Productos cargados desde `DB.productos.listarConDetalle()` (join `pos_productos_detalle` + `pos_productos` + `pos_categorias`)
- [x] Categorías dinámicas desde `DB.categorias.listar()`
- [x] Clientes cargados desde `DB.clientes.listar()` para selector en modal cobro
- [x] Canal físico cargado desde `DB.canalesVenta.obtenerPorCodigo('fisico')`
- [x] Persistencia de ventas en `DB.ventas.crearConDetalles()` (crea `pos_ventas` + `pos_ventas_detalle`)
- [x] Cache de 30s para productos y categorías
- [x] Eliminado PRODUCTOS mock (12 items), iconos reemplazados por inicial en círculo
- [x] Validación de stock usando datos reales de `stock_actual`

#### Módulo POS (Punto de Venta) — Fase 4: Caja Real
- [x] `caja.js` reescrito: init async con carga de datos desde Supabase
- [x] Cajas cargadas desde `DB.cajas.listar()`, selector poblado dinámicamente
- [x] Apertura activa desde `DB.cajaApertura.obtenerActiva()`
- [x] Historial desde `DB.cajaApertura.historial()`
- [x] Ventas del período desde `DB.ventas.obtenerPorPeriodo()` para calcular totales
- [x] Persistencia de apertura/cierre en `pos_caja_apertura`
- [x] Eliminados CAJAS_MOCK y HISTORIAL en memoria RAM

#### Módulo POS (Punto de Venta) — Fase 5: UI de Productos, Categorías e Inventario
- [x] `database.js` — Métodos `DB.movimientosInventario`, `DB.productos.ajustarStock()` añadidos
- [x] `productos.html` + `productos.js` — CRUD completo de productos con tabla, formulario, búsqueda, edición inline
- [x] `categorias.html` + `categorias.js` — CRUD completo de categorías con color, padre, activo/inactivo
- [x] `inventario.html` + `inventario.js` — Dashboard de existencias (total/con stock/bajo/agotado), ajuste manual de stock, historial de movimientos
- [x] Sidebar de `ventas.html` actualizado con links a productos.html, categorias.html, inventario.html

#### Módulo POS (Punto de Venta) — Anterior (UI/UX con datos mock)
- [x] `ventas.html` + `ventas.js` — Pantalla principal POS con:
  - Layout híbrido (Opción C): split-panel desktop, bottom sheet mobile
  - Grilla de productos con búsqueda y filtro por categorías
  - Carrito de compras con cantidad +/- y descuento por ítem
  - Validación de `descuento_max` contra rol del usuario (`pos.descuento.alto`)
  - Validación de stock al agregar producto y al confirmar cobro
  - Badge "Agotado" en productos sin stock
  - Margen de ganancia en tooltip y texto del producto
  - Modal cobro con selección de método de pago y cálculo de cambio
  - Modal post-cobro con opción "Emitir Factura Electrónica"
- [x] `caja.html` + `caja.js` — Control de caja (apertura/cierre/diferencia/cierre forzado)
- [x] `index.html` — Redirección automática a `login.html`
- [x] `css/estilo.css` — Estilos: bottom sheet animado, scrollbar, animaciones, dark mode
- [x] `manifest.json` — PWA manifest con icono SVG
- [x] `service-worker.js` — Service worker para instalación como app
- [x] `img/icon.svg` — Icono minimalista de la aplicación
- [x] Dark mode con toggle y persistencia en localStorage
- [x] Responsive mobile-first (360px→desktop) en todas las pantallas

#### Despliegue — Configuracion Vercel
- [x] `apps/pos/vercel.json` — Rewrite rule para clean URLs de factura-print: `"/factura-print" → "/factura-print.html"`. Necesario porque Vercel no tiene clean URLs nativas como `npx serve`.

#### Módulo POS (Punto de Venta) — Fase 8: Logo de Empresa desde DB
- [x] `database.js` — Bloque autoejecutable `cargarLogoHeader()` al final del IIFE que busca `.w-8.h-8.bg-slate-950.rounded-lg` en el header y reemplaza la "K" por `<img>` si `logo_url` existe. Con `onerror` que restaura `<span>K</span>` como fallback.
- [x] `login.js` — Carga el logo en el circulo central del login (`.w-14.h-14.bg-slate-950.rounded-2xl`), con mismo fallback K en `onerror`.
- [x] `factura-print.html` — Renderiza `<img>` condicional en `.inv-brand` usando clase CSS nativa `.inv-logo` (40px height, sin Tailwind). La pagina usa CSS plano por ser standalone de impresion.
- [x] `ventas.js`, `ventas-historial.js` — URLs de factura con formato clean (`factura-print?id=`) para compatibilidad con `npx serve` (evita redireccion 301 que pierde query params).
- [x] **Comportamiento:** Si `logo_url` tiene URL valida y accesible → se muestra en header, login y factura. Si es null/vacio → fallback visual (K). Si la URL falla al cargar → `onerror` restaura la K silenciosamente.

#### Módulo POS (Punto de Venta) — Fase 6: UI de Clientes, Proveedores y Compras
- [x] `clientes.html` + `clientes.js` — CRUD completo con `DB.clientes` (listar, crear, actualizar, eliminar, busqueda, paginacion)
- [x] `proveedores.html` + `proveedores.js` — CRUD completo con `DB.proveedores` (listar, crear, actualizar, eliminar, busqueda, paginacion)
- [x] `compras.html` + `compras.js` — CRUD completo con `DB.compras`, cards layout, IVA fix (tasa decimal 0.19), modal imagen producto, filtros combinados (texto+proveedor+estado), modal detalle de orden

#### Módulo POS (Punto de Venta) — Fase 7: UI de Facturacion, Gastos, Configuracion y Reportes
- [x] `facturacion.html` + `facturacion.js` — Listado de facturas con `DB.facturacion`, emitir/anular, filtro por periodo
- [x] `gastos.html` + `gastos.js` — CRUD de gastos con `DB.gastos` y `DB.gastoCategorias`, filtro por periodo, calculo de totales
- [x] `configuracion.html` + `configuracion.js` — Formulario de empresa con `DB.configuracionEmpresa` (logo_url, resolucion DIAN, NIT, etc.)
- [x] `reportes.html` + `reportes.js` — Dashboard financiero con `DB.finanzasMensuales`, ventas recientes, productos con bajo stock

#### Módulo POS (Punto de Venta) — Fase 9: Fix Stock Local Post-Venta
- [x] `database.js` — `_cacheClear('productos')` agregado en `ajustarStock()` (consistencia con otras mutaciones)
- [x] `ventas.js` — `stock_nuevo` capturado de `ajustarStock()` y aplicado a `PRODUCTOS[k].stock` inmediatamente
- [x] `ventas.js` — `nuevaVenta()` ahora recarga productos via `await cargarProductos()`

#### Módulo POS — Fase 10: Testing Infrastructure (vitest + jsdom)
- [x] `tests/` — 99 tests, 0 failures: 5 test files + helpers + setup global
- [x] `tests/compartido/database.test.js` (59 tests) — DB.clientes, DB.proveedores, DB.compras, DB.gastos, DB.gastoCategorias, DB.facturacion, DB.cajaApertura, DB.movimientosInventario, DB.configuracionEmpresa, DB.finanzasMensuales, DB.productos, DB.categorias
- [x] `tests/compartido/auth.test.js` (8 tests) — tienePermiso admin bypass, wildcard matching, requierePermiso
- [x] `tests/calculos/compras.test.js` (12 tests), `caja.test.js` (10 tests), `productos.test.js` (10 tests)
- [x] `tests/helpers/calculos-pos.js` — Funciones puras: IVA, descuento, diferencia caja, formatCOP
- [x] `tests/setup.js` — Setup global mocks via window.* (__supabase, KubitAuth, localStorage)
- [x] `vitest.config.js` + `package.json` script `test` → `vitest run`
- [x] `specs/13-testing-model.md` — Spec de testing automatico obligatorio para toda IA

#### Módulo POS — Fase 11: Icon-only Buttons & Mobile UX
- [x] `productos.js`, `compras.js`, `clientes.js`, `proveedores.js`, `categorias.js`, `gastos.js` — Todos los botones de accion (Ver/Editar/Eliminar) convertidos a icon-only (SVG + aria-label), sin texto visible
- [x] `ventas-historial.js`, `facturacion.js` — Boton Ver ya era icon-only desde commits anteriores
- [x] `productos.html` — Barra fija inferior con botones Limpiar/Guardar (`fixed bottom-0 z-30` + `pb-20` en contenedor + toast `bottom-20 z-40`)
- [x] `productos.html` — `#campo-tipo-producto` cambiado de `<input>` texto libre a `<select>` con Fisico (default), Digital, Servicio
- [x] `productos.html` — Seccion de usuario (`#user-avatar`, `#user-name`, `#user-rol`) agregada al header (faltaba vs. las otras 13 paginas)

#### Módulo POS (Punto de Venta) — Fase 12: Tags de Producto con Toggle Chips
- [x] `productos.html` — 6 chips toggle (Nuevo, Destacado, Oferta, Mas Vendido, Liquidacion, Imperdible) con `data-tag` en minuscula
- [x] `productos.js` — Tags leidos de `.tag-chip.active`, funciones `leerTagsDesdeChips()` y `marcarChipsActivos()`
- [x] `estilo.css` — Clases `.tag-chip.active` con `!important` para override Tailwind

#### Módulo POS (Punto de Venta) — Fase 13: PWA Completa (17 paginas)
- [x] `service-worker.js` — Reescrito: 38 assets criticos precacheados, cache-first, `skipWaiting()`, `clients.claim()`, rutas relativas
- [x] iOS meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`) en 17/17 paginas HTML
- [x] SW registration (`navigator.serviceWorker.register`) en 17/17 paginas HTML
- [x] `manifest.json` — Propiedad `categories` agregada: `["business","finance","shopping"]`
- [x] `manifest.json` — `start_url` corregido de `/apps/pos/ventas.html` a `ventas.html` (ruta relativa) + `scope` agregado
- [x] `img/icon-{192x192,512x512}.png` — Iconos PNG generados desde SVG para compatibilidad Android
- [x] `manifest.json` — Iconos PNG referenciados como primary, SVG como fallback con `purpose: "any"`
- [x] `apple-touch-icon` — Actualizado en 17/17 paginas: `href="img/icon.svg"` → `href="img/icon-192x192.png"`

#### Módulo POS (Punto de Venta) — Fase 14: Canales Dinamicos desde DB + Fix SW Redirect + Sidebar Unificado
- [x] Columna `tipo` (fisico/web_propio/marketplace) agregada a `pos_canales_venta` via DDL + seeds actualizados
- [x] `ventas.js`: nuevas funciones `renderizarCanales()`, `renderizarMarketplaces()`, `seleccionarTipo()`, `seleccionarMarketplace()`, `obtenerIconoCanal()`
- [x] Costos de canal visibles solo si `tipo === 'marketplace'` (dinamico, no hardcodeado a mercadolibre)
- [x] `service-worker.js`: fix handler `if (r && !r.redirected) return r; return fetch(e.request, { redirect: 'follow' })` para compatibilidad con `npx serve`
- [x] Sidebar: "Inventario" renombrado a "Stock" en las 16 paginas HTML del POS
- [x] `limpiar-sw.html`: pagina kill-switch creada y luego eliminada (depuracion local)
- [x] Desplegado en Vercel QA: `https://pos-calidad.vercel.app/`

#### Módulo POS — Fase 15: Herramientas (file renamer tool)
- [x] `herramientas.html` — Hub page con card grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) + header/sidebar POS completo
- [x] `herramientas/renombrar-archivos.html` — Tool page con 3-card workflow (Seleccionar Carpeta, Vista Previa, Resultados) + action bar externa
- [x] `js/herramientas/renombrar-archivos.js` — Lógica completa: File System Access API (`showDirectoryPicker`), renombrado masivo con estadísticas, preview editable, validaciones
- [x] `js/compartido/sidebar.js` — Función `toggleSidebar()` compartida para páginas de herramientas y hub
- [x] `css/estilo.css` — Clases `.herramienta-card` con hover/focus/active states slate-800
- [x] Sidebar actualizado en 14 páginas POS con grupo Herramientas insertado entre Caja/Finanzas y Administración
- [x] Fix: Cards 2 y 3 de renombrar-archivos.html cambiadas de `style="display:none"` a `class="hidden"` + `open`
- [x] Fix: Botones de acción movidos fuera de cards a `#action-bar` en flujo natural con show/hide contextual
- [x] Fix: Menú hamburguesa roto en herramientas.html (sidebar.js no existía) y renombrar-archivos.html (no incluía el script)
- [x] Tests: `npm test` → 99 passed, 0 failures

### 7.3 Pendiente
- [ ] `06-academy-spec.md` — Especificación del módulo Academy (post-MVP)
- [x] Migrar datos Fase 1: ejecutar scripts `01-migrate-usuarios.sql` → `08-migrate-gastos-mensuales-detalle.sql` en orden FK
- [x] Migrar datos Fase 2 — Productos: `09-migrate-productos-pos.sql` + `09b-update-store-data.sql` + `09c-migrate-productos-digitales.sql`
- [x] Migrar datos Fase 3 — Ventas, Compras, Movimientos: `10-migrate-ventas.sql` + `11-migrate-compras.sql` + `12-migrate-movimientos.sql` + `08b-relink-ventas-gastos.sql`
- [ ] Agregar más categorías a la DB para poblar el menú del navbar
- [ ] Asignar tags en DB a productos existentes para poblar carrusel y badges (UI ya implementada en POS y Store)

### 7.5 Completado (Documentacion de Migracion)
- [x] `specs/14-migracion-datos.md` — Spec completo de migracion V1→V2 con analisis campo a campo de 8 tablas (actualizado con Fase 2 y Fase 3)
- [x] `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/04-migrate-clientes.sql` — Script INSERT para pos_clientes (5 registros)
- [x] `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/09-migrate-productos-pos.sql` — 128 productos fisicos (POS)
- [x] `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/09b-update-store-data.sql` — 110 actualizaciones Store + 1178 multimedia
- [x] `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/09c-migrate-productos-digitales.sql` — 196 productos digitales (deduplicados) + 1756 imagenes + 196 videos
- [x] `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/10-migrate-ventas.sql` — 300 ventas + 318 detalle (canal MercadoLibre, metodo Transferencia)
- [x] `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/11-migrate-compras.sql` — 42 compras + 96 detalle
- [x] `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/12-migrate-movimientos.sql` — 446 movimientos de inventario
- [x] `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/08b-relink-ventas-gastos.sql` — 298 pares gasto-venta religados (regenerado sin temp table)
- [x] Convencion: scripts en `ScriptMigracionDB/` con nomenclatura `NN-migrate-<tabla>.sql`
- [x] Orden de migracion completo: 01→08 (Fase 1), 09→09c (Fase 2), 10→12+08b (Fase 3)

#### Módulo POS — Fase 17: Panel Dashboard + Tienda Virtual
- [x] `database.js::cargarLinkTienda()` — Bloque autoejecutable que busca `#link-tienda-virtual` y asigna href desde `pos_configuracion_empresa.store_url`
- [x] `database.js::ventas.topProductos(limite)` — Agregacion de ventas del mes por producto
- [x] `configuracion.html` + `configuracion.js` — Campo `store_url` en formulario de empresa
- [x] `panel.html` + `panel.js` — Dashboard con KPIs del Mes (finanzas), KPIs Operativos (ventas hoy, ticket, productos, stock bajo), Top 5, Accesos Rapidos
- [x] Sidebar actualizado en 16 paginas POS: grupo "Dashboard" arriba, link "Tienda Virtual" al final (target=_blank, URL desde DB)
- [x] `specs/02-database-schema.sql` — Columna `store_url` agregada
- [x] `npm test` → 99 passed, 0 failures

#### Módulo POS — Fase 18: Panel Compras en Tiempo Real
- [x] `database.js::DB.compras.totalDelMes()` — Nuevo metodo que suma `pos_compras.total` del mes en tiempo real via PostgREST, sin cache. Filtra `estado IN (RECIBIDA,PENDIENTE)`, excluye soft-delete, rango por fecha. Usa `api.get()` directo (operadores `in.()` e `is.null` no compatibles con `select()` helper).
- [x] `panel.js::cargarKpisMes()` — `f.compras_total || 0` reemplazado por `await DB.compras.totalDelMes(f.anio, f.mes)`. Query en vivo, refleja compras nuevas inmediatamente.
- [x] `database.test.js` — 3 nuevos tests: suma correcta (100000+129572=229572), array vacio retorna 0, error de red retorna 0.
- [x] `npm test` → 102 passed, 0 failures (99→102, +3 tests totalDelMes)

### 7.4 Próximo Paso Recomendado
**Despues del deploy:** Integración con MercadoLibre para sincronizar productos y pedidos.

---

## 8. Convenciones de Código (Resumen — Pendiente de detallar en `10-codex.md`)

- **JavaScript:** camelCase (`calcularTotal`), clases PascalCase
- **HTML:** kebab-case para IDs y clases (`btn-cobrar`, `modal-cliente`)
- **Archivos:** kebab-case (`perfil-cliente.js`, `lista-productos.html`)
- **Comentarios:** En español, solo cuando expliquen el "por qué", no el "qué"
- **Tailwind:** Preferir clases de utilidad sobre CSS personalizado
- **Componentes:** Un archivo por componente/funcionalidad
- **Importaciones:** Evitar dependencias externas. Preferir vanilla JS
- **Texto UI ASCII plano:** Todo texto visible al usuario sin tildes, diéresis, eñes ni caracteres especiales. Ver tabla de mapeo en `05-ui-ux-system.md` §8.

---

## 9. Archivos Informativos Externos

### 9.1 Carpeta `ArchivosInformativos/`
- Contiene archivos de referencia, documentación personal, análisis, versiones antiguas de esquemas, etc.
- **NO forma parte del proyecto Kubit.** Es material informativo externo.
- Está excluida de Git/GitHub vía `.gitignore`.
- Los agentes de IA solo deben leer archivos de esta carpeta cuando el usuario lo indique explícitamente.
- No usar ningún archivo de esta carpeta como fuente de verdad para decisiones de diseño o implementación a menos que el usuario lo ordene.

### 9.2 Subcarpeta `ScriptMigracionDB/`
- Contiene los scripts INSERT para migrar datos desde V1 (CSVs en `Basedatos/`) hacia V2 (Supabase).
- Nomenclatura: `NN-migrate-<tabla>.sql` donde NN = orden de ejecucion por dependencias FK.
- Los UUIDs originales de V1 se preservan en todos los scripts.
- Las transformaciones necesarias (ej: `impuesto_default /100`) se documentan dentro de cada script.
- El orden de ejecucion esta definido en `specs/14-migracion-datos.md` §3.
- **NO** confundir con los archivos de `specs/` — estos scripts son material operativo de migracion, no especificaciones de diseno.

---

## 10. Producción — Seguridad de Credenciales (REQUISITO OBLIGATORIO)

### 10.1 Regla #1: No exponer secrets en Git
- `apps/pos/js/config.js` contiene `SUPABASE_URL` y `SUPABASE_ANON_KEY` reales de QA.
- **En producción, este archivo DEBE estar en `.gitignore` y NO subirse a GitHub.**
- Durante desarrollo se subió temporalmente para pruebas en servidor remoto. Antes del deploy a producción, la IA debe revertir esto.

### 10.2 Cómo manejar credenciales en producción

**Opción A (recomendada): Variables de entorno en Vercel**
1. Ir a [Vercel Dashboard](https://vercel.com) → Project Settings → Environment Variables
2. Agregar: `SUPABASE_URL` y `SUPABASE_ANON_KEY`
3. En `config.js` o `supabase.js`, leer desde `process.env.SUPABASE_URL` o inyectar via server-side

**Opción B: Desplegar `config.js` manual en el servidor (NO via Git)**
1. SSH al servidor
2. Crear `apps/pos/js/config.js` con credenciales de producción
3. Mantener el archivo fuera del repositorio de Git

### 10.3 Checklist pre-producción (lo ejecuta la IA al hacer deploy)
- [ ] `apps/pos/js/config.js` eliminado del índice de git (`git rm --cached apps/pos/js/config.js`)
- [ ] `apps/pos/js/config.js` agregado a `.gitignore`
- [ ] Credenciales de producción configuradas en Vercel o servidor
- [ ] `config.ejemplo.js` actualizado con template de producción

---

## 12. Registro de Cambios

### 2026-06-08 — Navbar fixed en Store + Favicon SVG en 8 páginas

| Archivo | Cambio |
|---|---|
| `apps/store/js/compartido/navbar-store.js` | `sticky top-0 z-50` → `fixed top-0 left-0 right-0 z-50 w-full`. `sticky` fallaba con Tailwind CDN + flexbox layout. `fixed` es universalmente soportado. |
| `apps/store/index.html` | `pt-14` agregado a `<main id="app" class="flex-1">` para compensar altura del navbar fixed |
| `apps/store/producto.html` | `pt-14` agregado a `<main id="app" class="flex-1">` |
| `apps/store/carrito.html` | `pt-14` agregado a `<main class="flex-1 max-w-7xl ...">` |
| `apps/store/checkout.html` | `pt-14` agregado a `<main class="flex-1 max-w-7xl ...">` |
| `apps/store/sobre-nosotros.html` | Contenido envuelto en `<main class="flex-1 pt-14">` + `</main>` antes del footer |
| `apps/store/terminos-condiciones.html` | Contenido envuelto en `<main class="flex-1 pt-14">` + `</main>` |
| `apps/store/politica-privacidad.html` | Contenido envuelto en `<main class="flex-1 pt-14">` + `</main>` |
| `apps/store/preguntas-frecuentes.html` | Contenido envuelto en `<main class="flex-1 pt-14">` + `</main>` |
| `apps/store/*.html` (las 8) | `<link rel="icon" type="image/svg+xml" href="img/icon.svg">` agregado en `<head>` después de apple-touch-icon |

### 2026-06-08 — Store Badges: fix mas_vendido, add nuevo/imperdible

| Archivo | Cambio |
|---|---|
| `apps/store/js/compartido/card-producto.js` | `badgeMap`: key `'mas-vendido'` corregido a `'mas_vendido'`, agregados `nuevo` e `imperdible` |
| `apps/store/js/compartido/card-producto.js` | `ofertaTags`: removidos `imperdible` e `imperdibles` |
| `apps/store/js/compartido/card-producto.js` | `renderBadge`: agregados iconos para `nuevo`, `mas-vendido`, `imperdible` |
| `apps/store/css/estilo.css` | Clases `.badge-nuevo` (azul), `.badge-imperdible` (purpura) agregadas |

### 2026-06-03 — UI Fixes & Refinements POS

| Archivo | Cambio |
|---|---|
| `apps/pos/ventas.html` | Canal de Venta movido de "Informacion de la Venta" al header, entre subtitulo y link "Modo Mostrador" |
| `apps/pos/ventas.html` | Tarjeta Totales redisenada: `max-w-lg ml-auto` eliminado, ahora full-width con barra de stats (productos, unidades, ticket prom.) |
| `apps/pos/js/paginas/ventas.js` | Fix menu hamburguesa: eliminada referencia a `comision-info` (elemento inexistente) que crasheaba `init()` |
| `apps/pos/js/paginas/ventas.js` | Agregada funcion `setClienteDefecto()`: auto-completa cliente con documento "222222222222" |
| `apps/pos/js/paginas/ventas.js` | Fix subtotal en tiempo real: agregada clase `cell-subtotal` + funcion `actualizarSubtotalRow()` para actualizar subtotal sin re-renderizar toda la tabla |
| `apps/pos/js/paginas/ventas.js` | Fix modal post-venta: `CARRITO = []` y `actualizarCarrito()` movidos de `procesarVenta()` a `nuevaVenta()` para evitar confusion de valores en background |
| `apps/pos/js/paginas/ventas.js` | Agregada funcion `actualizarStatsCarrito()` para calcular stats de la barra en Totales |
| `apps/pos/js/compartido/database.js` | `ventas.obtener()`: agregado `canal:canal_id(*)` y nested `detalle:producto_detalle_id(*,producto:producto_id(nombre))` para traer nombre del producto |
| `apps/pos/ventas-historial.html` | Modal de detalle: `sm:max-w-lg` -> `sm:max-w-2xl` -> `sm:max-w-4xl` (896px) |
| `apps/pos/js/paginas/ventas-historial.js` | Productos en modal: muestra `d.detalle.producto.nombre` en vez del UUID, formato 4-columnas (nombre, und., precio u., total) |

### 2026-06-03 — Logo de Empresa desde DB (Fase 8)

| Archivo | Cambio |
|---|---|
| `apps/pos/js/compartido/database.js` | Bloque autoejecutable `cargarLogoHeader()` al final del IIFE: busca `.w-8.h-8.bg-slate-950.rounded-lg` en el header, carga `DB.configuracionEmpresa.obtener()`, y reemplaza la "K" por `<img>` si `logo_url` existe. Con `onerror` para fallback silencioso. Afecta a las 14 pantallas POS sin modificar cada HTML/JS individual. |
| `apps/pos/js/paginas/login.js` | Carga el logo en el contenedor `.w-14.h-14.bg-slate-950.rounded-2xl` del login, reemplazando la "K" estatica. |
| `apps/pos/factura-print.html` | Agrega variable `empresaLogo` y renderiza `<img>` condicional en `.inv-brand` (antes del nombre de empresa) si `logo_url` existe. |

### 2026-06-03 — Fix 404 factura-print en Vercel

| Archivo | Cambio |
|---|---|
| `apps/pos/vercel.json` | Nuevo archivo con rewrite: `"/factura-print" → "/factura-print.html"`. Resuelve 404 en Vercel por clean URLs. |

### 2026-06-03 — Fixes post-implementacion Logo

| Archivo | Cambio |
|---|---|
| `apps/pos/js/compartido/database.js` | Fallback K en `onerror`: restaura `<span>K</span>` en vez de dejar contenedor vacio (evita cuadro negro) |
| `apps/pos/js/paginas/login.js` | Mismo fallback K en el circulo del login |
| `apps/pos/factura-print.html` | Clase CSS nativa `.inv-logo` (height: 40px, object-fit: contain). Reemplazadas clases Tailwind que no funcionaban por ser pagina standalone sin CDN. Iteracion de tamano: 64px -> 32px -> 40px |
| `apps/pos/js/paginas/ventas.js` | URL de factura cambia a clean URI (`factura-print?id=`) para evitar redireccion 301 de `npx serve` |
| `apps/pos/js/paginas/ventas-historial.js` | Mismo cambio clean URLs |

### 2026-06-05 — Multi-variante, Modo Oscuro Default, Header Fixed, Usuario en Header

| Archivo | Cambio |
|---|---|
| `apps/pos/productos.html` | Nuevo campo `#campo-tags` en card Multimedia |
| `apps/pos/productos.html` | Cards "Precios y Costos" + "Inventario" reemplazadas por "Variantes y Precios" con toggle single/multi-variante, tabla editable, filas expandibles (▼) |
| `apps/pos/productos.html` | `#campo-impuesto` movido fuera del toggle, siempre visible |
| `apps/pos/productos.html` | Default IVA cambiado a `value="0" selected` (0% Exento) |
| `apps/pos/js/paginas/productos.js` | Funciones: `toggleModoVariantes()`, `renderizarAtributos()`, `leerAtributosDesdeDOM()`, `syncVariantesFromDOM()`, `renderizarTablaVariantes()`, `agregarVariante()`, `eliminarVariante()`, `resetVariantState()` |
| `apps/pos/js/paginas/productos.js` | `guardarProducto()`: guarda N variantes con `atributos`, `precio_original`, `precio_mayorista`, `descuento_max`, `stock_min/max`, `peso`, `dimensiones` |
| `apps/pos/js/paginas/productos.js` | `cargarEnForm()`: carga multi-variante desde DB |
| `apps/pos/js/paginas/productos.js` | Fix `agregarVariante()`: corrige typo `attrs`→`attr`, agrega `syncVariantesFromDOM()` antes de re-renderizar |
| `apps/pos/js/paginas/productos.js` | Stock Min por defecto = 2 en `agregarVariante()` y `limpiarFormulario()` |
| `apps/pos/js/compartido/database.js` | Nuevo método `DB.productos.detalleEliminar()` (softDelete) |
| `apps/pos/*.html` (14 páginas) | Modo oscuro default: `<html class="dark">` + anti-flash script inline |
| `apps/pos/*.html` (14 páginas) | Header fixed: `shrink-0` → `fixed top-0 left-0 right-0 z-30` |
| `apps/pos/*.html` (14 páginas) | Scroll container: `pt-16` agregado para compensar header fixed |
| `apps/pos/*.html` (12 páginas) | Sección de usuario (`#user-avatar`, `#user-name`, `#user-rol`) agregada al header |
| `apps/pos/js/compartido/auth.js` | Nueva función `poblarUserHeader()` centralizada, llamada desde `cargarSesion()` y `login()` |
| `specs/02-database-schema.sql` | Trigger de slug actualizado: sufijo numérico `-1`, `-2`... en colisiones |

### 2026-06-05 — Fix Sidebar: Admin ve todas las paginas

| Archivo | Cambio |
|---|---|
| `apps/pos/js/compartido/auth.js` | `tienePermiso()`: agregado bypass `if (USUARIO_ACTUAL.rolNombre === 'Administrador') return true;` al inicio |
| `apps/pos/caja.html` | Sidebar normalizado: agregados grupos Compras, Clientes, Administracion + links Historial, Gastos, Reportes |
| `apps/pos/inventario.html` | Sidebar normalizado: agregados grupos Compras, Clientes + links Historial, Movimientos |
| `specs/seed-permisos.sql` | Nuevo archivo con seed data para `pos_roles`, `pos_permisos`, `pos_rol_permisos` |

### 2026-06-05 — IVA Fix, Cards Layout, Modal Imagen, Filtros en Compras

| Archivo | Cambio |
|---|---|
| `apps/pos/js/paginas/compras.js` | Fix IVA: `tasa = (d.tasa_impuesto \|\| 0)` sin `/ 100` en `renderizarDetalle()` y `onDetalleChange()` — DB almacena 0.19 (decimal), no 19 |
| `apps/pos/js/paginas/compras.js` | Fix IVA display en modal detalle (line 715): `Math.round(parseFloat(d.tasa_impuesto) * 100) + '%'` muestra "19%" en vez de "0.19%" |
| `apps/pos/compras.html` | Card 1 "Nueva Orden de Compra" partida en 3 cards independientes: Datos del Proveedor, Catalogo de Productos, Productos en la Orden |
| `apps/pos/compras.html` | Card 2 "Lista de Ordenes" renumerada a Card 4 |
| `apps/pos/compras.html` | Nuevo modal `#modal-producto-imagen` (max-w-lg, responsive, loading/image/empty states) |
| `apps/pos/js/paginas/compras.js` | `renderizarCatalogo()`: agregado `data-producto-id`, icono SVG imagen, `cursor-pointer select-none` en celda nombre |
| `apps/pos/js/paginas/compras.js` | Nuevas funciones: `abrirModalImagenProducto(productoId, nombre)` y `cerrarModalImagenProducto()` |
| `apps/pos/js/paginas/compras.js` | Eventos imagen: `dblclick` en nombre (desktop), `click` en icono `.btn-ver-img-catalogo` (mobile+desktop), Escape/overlay/X |
| `apps/pos/compras.html` | Card 4: agregados dropdowns `#filtro-proveedor` y `#filtro-estado` en la barra de busqueda |
| `apps/pos/js/paginas/compras.js` | `filtrarYRender()`: filtro combinado texto + proveedor_id + estado (AND) |
| `apps/pos/js/paginas/compras.js` | `cargarProveedores()`: pobla tambien `#filtro-proveedor` con opciones |
| `apps/pos/js/paginas/compras.js` | `bindearEventos()`: listeners `change` en `#filtro-proveedor` y `#filtro-estado` |

### 2026-06-05 — Fix Stock Local Post-Venta

| Archivo | Cambio |
|---|---|
| `apps/pos/js/compartido/database.js` | `_cacheClear('productos')` agregado en `ajustarStock()` (linea 255) para invalidar cache tras cada ajuste de stock |
| `apps/pos/js/paginas/ventas.js` | `stock_nuevo` capturado de `ajustarStock()` y aplicado a `PRODUCTOS[k].stock` inmediatamente (lineas 568-582) |
| `apps/pos/js/paginas/ventas.js` | `nuevaVenta()` ahora es `async` y recarga productos via `await cargarProductos()` (linea 668-673) |

### 2026-06-06 — Botones Icon-only, Barra Fija Mobile, Tipo Producto Select, Seccion Usuario Productos

| Archivo | Cambio |
|---|---|
| `apps/pos/js/paginas/productos.js` | Botones Editar/Eliminar: spans de texto reemplazados por SVG icons + aria-label (variantes + multimedia) |
| `apps/pos/js/paginas/compras.js` | Botones Editar/Eliminar: texto plano reemplazado por SVG icons + aria-label |
| `apps/pos/js/paginas/clientes.js` | Boton Editar/Eliminar: texto plano reemplazado por SVG icons + aria-label |
| `apps/pos/js/paginas/proveedores.js` | Boton Editar/Eliminar: texto plano reemplazado por SVG icons + aria-label |
| `apps/pos/js/paginas/categorias.js` | Boton Editar/Eliminar: texto plano reemplazado por SVG icons + aria-label |
| `apps/pos/js/paginas/gastos.js` | Botones Editar/Eliminar (gastos + categorias de gasto): texto plano reemplazado por SVG icons + aria-label |
| `apps/pos/productos.html` | Barra fija inferior: botones "Limpiar" y "Guardar Producto" movidos a `fixed bottom-0 z-30` con `pb-20` + toast `bottom-20 z-40` |
| `apps/pos/productos.html` | `#campo-tipo-producto`: `<input>` texto libre → `<select>` con Fisico (default), Digital, Servicio |
| `apps/pos/productos.html` | Seccion de usuario (`#user-avatar`, `#user-name`, `#user-rol`) agregada al header |
| `apps/pos/productos.html` | Header ahora identico a las otras 13 paginas (dark toggle + user section) |

### 2026-06-06 — Fixed Bottom Bar Global (Arquitectura)

| Archivo | Cambio |
|---|---|
| `apps/pos/css/estilo.css` | Nueva clase `.content-actions-pb` (`padding-bottom: 4rem`) para estandarizar el patron de barra fija |
| `apps/pos/categorias.html` | pb-20, barra `fixed bottom-0 z-30` con Limpiar+Guardar, toast `bottom-20 z-40` |
| `apps/pos/clientes.html` | pb-20, barra `fixed bottom-0 z-30` con Limpiar+Guardar, toast `bottom-20 z-40` |
| `apps/pos/proveedores.html` | pb-20, barra `fixed bottom-0 z-30` con Limpiar+Guardar, toast `bottom-20 z-40` |
| `apps/pos/compras.html` | pb-20, barra `fixed bottom-0 z-30` con Limpiar+Guardar, toast `bottom-20 z-40` |
| `apps/pos/configuracion.html` | pb-20, barra `fixed bottom-0 z-30` con Guardar+Reiniciar, toast `bottom-20 z-40` |
| **Total:** 6 paginas con CRUD | Ahora todas usan el mismo patron de barra fija inferior para mobile |

### 2026-06-06 — Fixed Bottom Bars Removed (Static Flow como ventas.html)

| Archivo | Cambio |
|---|---|
| `apps/pos/productos.html` | Fixed bar removida → flujo normal (`flex flex-col sm:flex-row gap-3 pt-2`), `pb-20` quitado, toast `bottom-6 z-50` |
| `apps/pos/categorias.html` | Fixed bar removida → flujo normal, `pb-20` quitado, toast `bottom-6 z-50` |
| `apps/pos/clientes.html` | Fixed bar removida → flujo normal, `pb-20` quitado, toast `bottom-6 z-50` |
| `apps/pos/proveedores.html` | Fixed bar removida → flujo normal, `pb-20` quitado, toast `bottom-6 z-50` |
| `apps/pos/compras.html` | Fixed bar removida → flujo normal, `pb-20` quitado, toast `bottom-6 z-50` |
| `apps/pos/configuracion.html` | Fixed bar removida → flujo normal, `pb-20` quitado, toast `bottom-6 z-50` |
| **Total:** 6 paginas | Botones ahora accesibles via scroll natural, sin overlap jamas. Misma experiencia que `ventas.html` |

### 2026-06-08 — Tags de Producto: texto libre reemplazado por toggle chips

| Archivo | Cambio |
|---|---|
| `apps/pos/productos.html` | `<input id="campo-tags">` reemplazado por 3 toggle chips (Nuevo, Destacado, Oferta) con `data-tag` en minúscula |
| `apps/pos/js/paginas/productos.js` | Tags se leen de `.tag-chip.active` en vez de `input.value.split(',')`. Al cargar producto se marcan chips activos. `limpiarFormulario()` resetea chips. Nuevo event listener en `#tags-container` para toggle click |
| `apps/pos/css/estilo.css` | Nuevas clases `.tag-chip.active` (fondo slate-950) y `.dark .tag-chip.active` (fondo blanco) con `!important` para override Tailwind |

### 2026-06-08 — Checkout Store: Edge Function eliminada, REST API directa

| Archivo | Cambio |
|---|---|
| `apps/store/js/paginas/checkout.js` | Reemplazada llamada a Edge Function `create-pedido` por 7 operaciones REST directas via `__supabase.get()/post()`: obtener canal Web, buscar/crear cliente, crear direccion, generar numero pedido, crear pedido con `canal_id`, resolver detalle de productos y crear detalle del pedido |
| `supabase/functions/create-pedido/` | Directorio eliminado — Edge Function ya no se necesita |
| `supabase/config.toml` | Seccion `[functions.create-pedido]` eliminada |
| `specs/seed-anon-grants-store.sql` | Nuevo archivo SQL con grants INSERT + RLS policies para rol `anon` en `pos_clientes`, `st_direcciones`, `st_pedidos`, `st_pedidos_detalle` |

### 2026-06-08 — Store Badges: fix mas_vendido, add nuevo/imperdible, scrollbar, checkout UX

| Archivo | Cambio |
|---|---|
| `apps/store/js/compartido/card-producto.js` | `badgeMap`: key `'mas-vendido'` corregido a `'mas_vendido'`, agregados `nuevo` e `imperdible` |
| `apps/store/js/compartido/card-producto.js` | `ofertaTags`: removidos `imperdible` e `imperdibles` |
| `apps/store/js/compartido/card-producto.js` | `renderBadge`: agregados iconos para `nuevo`, `mas-vendido`, `imperdible` |
| `apps/store/css/estilo.css` | Clases `.badge-nuevo` (azul), `.badge-imperdible` (purpura) agregadas |
| `apps/store/css/estilo.css` | Scrollbar horizontal visible en menu categorias desktop |
| `apps/store/js/paginas/checkout.js` | Campos Departamento y Ciudad intercambiados de orden |
| `apps/store/js/paginas/checkout.js` | Ciudad ahora usa `<datalist>` con opciones filtradas por departamento seleccionado |
| `apps/store/factura-print.html` | Columna "Impuesto" agregada con `d.impuesto \|\| 0` |

### 2026-06-12 — Canales Dinamicos POS, Fix SW redirect, Sidebar Stock, Deploy Vercel QA

| Archivo | Cambio |
|---|---|
| `specs/02-database-schema.sql` | ADD COLUMN `tipo text not null default 'propio'` en `pos_canales_venta`. Seed data actualizado: Exito.com, Falabella.com como marketplaces |
| `apps/pos/ventas.html` | Reemplazados 3 labels fijos de canal por contenedor dinamico + `<select id="select-marketplace">` para marketplaces |
| `apps/pos/js/paginas/ventas.js` | Nuevas funciones: `renderizarCanales()`, `renderizarMarketplaces()`, `seleccionarTipo()`, `seleccionarMarketplace()`, `obtenerIconoCanal()`. Eliminada dependencia de `'mercadolibre'` hardcodeado. Logica de costos ahora usa `tipo === 'marketplace'` |
| `apps/pos/service-worker.js` | Fix handler: `if (r && !r.redirected) return r; return fetch(e.request, { redirect: 'follow' })`. Cache bump v2→v3→v4 |
| `apps/pos/*.html` (16 paginas) | Sidebar: "Inventario" renombrado a "Stock" |
| `apps/pos/limpiar-sw.html` | Creada y eliminada post-commit (kill-switch page para depuracion local) |
| `specs/03-pos-spec.md` | Documentacion de columna `tipo` en tabla `pos_canales_venta` |
| **Deploy** | Sincronizado a GitHub + Vercel: `https://pos-calidad.vercel.app/` |

### 2026-06-08 — POS PWA Completa (Service Worker + iOS Meta Tags + SW Registration)

| Archivo | Cambio |
|---|---|
| `apps/pos/service-worker.js` | Reescrito completo: 38 assets precacheados, cache-first con fallback network, `skipWaiting()`, `clients.claim()`, rutas relativas |
| `apps/pos/*.html` (17 paginas) | Meta tags iOS (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`) + `apple-touch-icon` agregados en `<head>` |
| `apps/pos/*.html` (17 paginas) | Bloque `navigator.serviceWorker.register('service-worker.js')` agregado al final de `<body>` |
| `apps/pos/manifest.json` | `categories: ["business","finance","shopping"]` agregado |
| `apps/pos/index.html` | PWA head tags completos (antes solo tenia manifest link) |
| `apps/pos/factura-print.html` | PWA head tags completos + SW registration (antes no tenia ninguno) |
| `tests/` | Verificacion: `npm test` → 99 tests, 0 failures (5 suites) |

### 2026-06-08 — Fix PWA Android: start_url relativo + iconos PNG

| Archivo | Cambio |
|---|---|
| `apps/pos/manifest.json` | `start_url` corregido de `/apps/pos/ventas.html` a `ventas.html` (relativo). `scope` agregado. Iconos PNG 192x192 y 512x512 como primary, SVG como `purpose: "any"` fallback. |
| `apps/pos/img/icon-192x192.png` | Nuevo archivo generado desde `icon.svg` via `sharp` |
| `apps/pos/img/icon-512x512.png` | Nuevo archivo generado desde `icon.svg` via `sharp` |
| `apps/pos/*.html` (17 paginas) | `<link rel="apple-touch-icon">` actualizado: `href="img/icon.svg"` → `href="img/icon-192x192.png"` |

### 2026-06-08 — Correo transaccional postergado a post-MVP

| Archivo | Cambio |
|---|---|
| `specs/06-servicio-correo.md` | Simplificado: banner POST-MVP, eliminado Database Webhook, campo `tipo`, template cambio-estado y §6.2. Contrato reducido a solo `{ pedidoId }`. Un solo template de confirmacion inline en `index.ts`. Checklist limpiado. |
| `specs/01-master-spec.md` | `06-servicio-correo.md` agregado al mapa de artefactos. |
| **Decision** | No implementar en v1. Con ~1 venta/mes, el costo supera el beneficio. Alternativa: modal de exito en checkout + gestion manual del store owner. |

### 2026-06-12 — KPI Bar "Ventas Hoy / Total Hoy / Promedio" en ventas.html

| Archivo | Cambio |
|---|---|
| `apps/pos/ventas.html` | Nueva barra compacta de 3 indicadores (Hoy, Total, Prom.) entre header y Card 1. Diseno: `flex flex-wrap` con iconos SVG + `text-xs`. 30px altura vs 180px de cards. Sin cache, actualizacion inmediata post-venta. |
| `apps/pos/js/compartido/database.js` | Nuevo metodo `ventas.estadisticasHoy()` usa agregados nativos PostgREST: `/pos_ventas?select=count,sum:total,avg:total&estado=eq.CONFIRMADA&fecha_venta=gte.{hoy}`. Devuelve 1 fila, peso minimo, sin cache. |
| `apps/pos/js/paginas/ventas.js` | Nueva funcion `cargarEstadisticas()` con fallback silencioso a `—` en error. Llamada en `init()` via `Promise.all` y post-`procesarVenta()` para refresco inmediato. |
| **Design** | Barra sutil coherente con stats bar de Totales. No rompe patron `<details>` cards. Mobile: cada indicador en su propia linea via `flex-wrap`. Valores iniciales `—` hasta que carga la API. |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-12 — Columna `codigo_interno` en Modal Detalle de Historial

| Archivo | Cambio |
|---|---|
| `apps/pos/js/paginas/ventas-historial.js` | Agregado `<span class="text-xs text-slate-400 font-mono w-20 truncate">` con `d.detalle.codigo_interno` antes del nombre del producto. Solo se renderiza si existe el codigo. Sin cambios en HTML (`sm:max-w-4xl` ya tiene espacio). Sin cambios en DB (`codigo_interno` ya venia en el join existente). |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-12 — Store Lightbox Modal (galeria producto fullscreen)

| Archivo | Cambio |
|---|---|
| `apps/store/css/estilo.css` | 102 lineas nuevas: `.lightbox-overlay`, `.lightbox-toolbar`, `.lightbox-arrow`, `.lightbox-dot`, `.lightbox-imagen.desvanecer` para crossfade CSS, responsive mobile-first 360px+, fullscreen overlay con z-index 60 |
| `apps/store/js/paginas/producto.js` | Reestructuracion completa: todas las funciones movidas **dentro** del callback `DOMContentLoaded` para compartir la clausura con `_lightboxImagenes`, `_lightboxIndice`, `_autoplayTimer`, `_autoplayActivo`, `_tiempoFuera` |
| `apps/store/js/paginas/producto.js` | Nuevas funciones (216 lineas): `abrirLightbox()`, `cerrarLightbox()`, `renderizarDots()`, `actualizarImagen()` con crossfade, `navegarLightbox()`, `toggleAutoplay()`, `iniciarAutoplay()` (4s), `detenerAutoplay()`, `pausarAutoplayTemporal()` (reanuda 3s), `actualizarBotonAutoplay()`, `bindearEventosLightbox()` |
| `apps/store/js/paginas/producto.js` | Eventos: click en X/overlay/Escape para cerrar, flechas ← → y teclado, swipe touch (>50px), dots navegables, boton autoplay con icono play/pause |
| `apps/store/js/paginas/producto.js` | `cursor-pointer` agregado via JS condicionalmente solo si hay mas de 1 imagen (linea 70) |
| `producto.html` | `cursor-pointer` removido del HTML estatico, ahora se asigna via JS solo cuando hay multiples imagenes |
| **Scope fix** | `ReferenceError: _lightboxIndice is not defined` corregido moviendo todas las funciones dentro del mismo callback DOMContentLoaded. Causa raiz: las funciones declaradas fuera del callback no tenian acceso a las variables de clausura del arrow function `async () => { ... }` |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-12 — Store: Productos Agotados visibles con badge + bloqueo de carrito

| Archivo | Cambio |
|---|---|
| `apps/store/js/api/productos.js` | Agregado `stock: primerDetalle.stock_actual \|\| 0` al mapper `mapearProducto()`. Antes el stock solo se mapeaba para productos multi-variante, los de variante unica no tenian campo `stock`. |
| `apps/store/js/compartido/card-producto.js` | **Badge:** fallback de `-1` a `producto.stock \|\| 0` en `obtenerBadges()` — ahora detecta agotado en productos de variante unica. **Boton:** si agotado → `bg-slate-200 text-slate-400 cursor-not-allowed disabled` con texto "Agotado". **Cart block:** `agregarAlCarrito()` valida stock al inicio y muestra modal con SVG de bolsa tachada si stock ≤ 0. |
| `apps/store/js/paginas/producto.js` | Detalle de producto: verifica `obtenerBadges()` + stock de variante seleccionada antes de agregar al carrito. |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-13 — Store & POS Service Worker Rewrite (localhost bypass, postMessage auto-reload, cache versioning, Vercel compat)

| Archivo | Cambio |
|---|---|
| `apps/store/service-worker.js` | **Reescrito completo.** `const ES_LOCAL` detecta `localhost`/`127.0.0.1` y bypass: `return;` sin `e.respondWith()` en fetch, omite precache en install/activate. Cache-first con `!r.redirected` check. `.catch(() => fetch(e.request))` en fetch handler para evitar "listener indicated asynchronous response". `ignoreSearch:true` en `caches.match()` para rutas con query params (`producto.html?slug=...`). `postMessage({accion:'recargar'})` en activate via `clients.matchAll()`. Cache version `outletshop-YYYYMMDD-NN`. Assets agregados: `carrito.html`, `checkout.html`, `footer-store.js`, `carrito.js`, `checkout.js`, `img/icon.svg`, `img/icon2.svg`, `sobre-nosotros.html`, `terminos-condiciones.html`, `politica-privacidad.html`, `preguntas-frecuentes.html`. |
| `apps/pos/service-worker.js` | **Reescrito.** Misma arquitectura que Store: `ES_LOCAL`, `!r.redirected`, `.catch()`, `ignoreSearch:true`, `postMessage` auto-reload, cache version `kubit-pos-YYYYMMDD-NN`. Assets actualizados: 34 criticos (agregados `facturacion.html`, `gastos.html`, `reportes.html`, `movimientos.html`). |
| `apps/store/*.html` (8 paginas) | Agregado listener `navigator.serviceWorker` `message` → `location.reload()` para recarga automatica post-SW-activate. |
| `apps/store/js/paginas/producto.js` | DOMContentLoader envuelto en `try/catch` con mensaje fallback "Error al cargar el producto. Por favor, recarga la pagina." en el contenedor `#app`. |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-13 — Store Lightbox: autoplay automatico al abrir (3s) + click-outside cierra modal

| Archivo | Cambio |
|---|---|
| `apps/store/js/paginas/producto.js` | `abrirLightbox()`: `detenerAutoplay()` removido, `iniciarAutoplay()` agregado al final (despues de que el DOM del overlay existe). El autoavance arranca automaticamente al abrir el modal. |
| `apps/store/js/paginas/producto.js` | `iniciarAutoplay()`: agregado guard `if (_lightboxImagenes.length <= 1) return;` — no inicia autoplay si hay 1 sola imagen. Intervalo cambiado de 4000ms a 3000ms. |
| `apps/store/js/paginas/producto.js` | `pausarAutoplayTemporal()`: intervalo cambiado de 4000ms a 3000ms (consistencia). |
| `apps/store/js/paginas/producto.js` | Overlay click handler: cambiado de `if (e.target === overlay)` (solo backdrop) a exclusion por clase: cierra al hacer clic en cualquier elemento que NO sea `.lightbox-imagen`, `.lightbox-arrow`, `.lightbox-dot`, `.lightbox-btn` o `.lightbox-close`. Estandar de industria (Fancybox, GLightbox, Photoswipe). |
| **Tests** | `npm test` → 99 passed, 0 failures |
| **Verificado** | Modo incognito: autoplay arranca solo, click fuera de imagen cierra modal. |

### 2026-06-13 — Redes Sociales Store: URLs reales + target blank en navbar y footer

| Archivo | Cambio |
|---|---|
| `apps/store/js/compartido/footer-store.js` | 10 hrefs actualizados de `#` a URLs reales: Facebook, TikTok, Threads, YouTube, WhatsApp. Instagram ya estaba correcto. `target="_blank" rel="noopener noreferrer"` agregado a los 12 links (2 secciones × 6 redes). |
| `apps/store/js/compartido/navbar-store.js` | 10 hrefs actualizados de `#` a URLs reales: Facebook, Instagram, TikTok, Threads, YouTube. `target="_blank" rel="noopener noreferrer"` agregado a los 10 links (2 secciones × 5 redes). |
| `apps/store/index.html` | 2 Instagram links normalizados: `https://instagram.com/outletshop_for_my` → `https://www.instagram.com/OutletShop_for_my/` (ya tenian `target="_blank"`). |
| **Estandar** | Links externos (redes sociales) usan `target="_blank" rel="noopener noreferrer"` para preservar sesion de compra (carrito, busqueda) y prevenir tabnabbing. Estandar Amazon, MercadoLibre, Shopify. |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-13 — Footer Store: tagline cambiado a Alternativa 4

| Archivo | Cambio |
|---|---|
| `apps/store/js/compartido/footer-store.js` | Texto del footer reemplazado por: "Productos fisicos y digitales con los mejores precios del mercado. Compras seguras, envios confiables y un equipo comprometido con tu satisfaccion." Aplicado en version mobile (linea 13) y desktop (linea 85). |

### 2026-06-13 — Footer Store: diseno compacto, brand+social misma fila

| Archivo | Cambio |
|---|---|
| `apps/store/js/compartido/footer-store.js` | Reescrito completo: brand y redes sociales en misma fila (`flex justify-between`), acordeon compacto (`py-2` en vez de `py-3`), grid desktop de 4 a 2 columnas, padding reducido (`py-6 sm:py-8`), descripcion unificada con copyright al final. Altura reducida ~50%. Sin contenido duplicado. Iconos redes sociales `w-7 h-7` mobile (antes `w-10 h-10`). |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-13 — Sobre Nosotros: foto del equipo agregada

| Archivo | Cambio |
|---|---|
| `apps/store/sobre-nosotros.html` | Seccion "Nuestro Equipo" redisenada: de card de texto plano a grid `lg:grid-cols-5` con foto `EquipoOutletShop.jpg` (col-span-3) + texto descriptivo (col-span-2). Altura maxima foto 420px. Responsive: apilado en mobile, lado a lado en desktop. |
| `apps/store/img/EquipoOutletShop.jpg` | Nuevo archivo: foto del equipo de trabajo. |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-13 — FAQ expandido: 15 preguntas en 5 categorias + indice + fecha

| Archivo | Cambio |
|---|---|
| `apps/store/preguntas-frecuentes.html` | Hero: agregada fecha de ultima actualizacion. Indice de categorias con navegacion por anclajes. Contenido reestructurado en 5 categorias (Pedidos, Envios, Pagos, Devoluciones, Soporte) con separadores visuales. Preguntas expandidas de 5 a 15 (incluye: modificar/cancelar pedido, comprar sin registro, tiempos de envio, costo/envio gratuito, rastreo, seguridad pagos, garantia, producto danado, horario atencion). |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-13 — Politica de Privacidad reestructurada con indice + contenido faltante

| Archivo | Cambio |
|---|---|
| `apps/store/politica-privacidad.html` | Hero: agregada fecha de ultima actualizacion. Indice de contenidos con 9 anclajes. Contenido migrado de `white-space: pre-line` a secciones HTML con `<section>` + `id` + `scroll-mt-20`. Contenido nuevo: base legal por tratamiento (ejecucion contractual, consentimiento, interes legitimo, obligacion legal), plazo de conservacion (5 anos + 12 meses anonimizados), tipos de cookies (esenciales, rendimiento, funcionalidad), procedimiento para ejercer derechos ARCO (15 dias habiles). |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-13 — Terminos y Condiciones reestructurados + fix URL mitiendanube

| Archivo | Cambio |
|---|---|
| `apps/store/terminos-condiciones.html` | **Fix critico:** URL `https://outletshop62.mitiendanube.com/` eliminada, reemplazada por texto generico ("opera a traves de su sitio web oficial y canales de venta digitales"). Hero: agregada fecha de ultima actualizacion. Indice de contenidos con 11 anclajes en grid 2 columnas. Contenido migrado de `white-space: pre-line` a secciones HTML con `<section>` + `id` + `scroll-mt-20`. Secciones agregadas: legislacion aplicable (tribunales de Medellin), contacto para notificaciones legales. Numeracion cambiada a listas `<ol>` y `<ul>` en Reversion del Pago y Cambios/Garantias. Lenguaje simplificado manteniendo valor legal. |
| **Tests** | `npm test` → 99 passed, 0 failures |

### 2026-06-13 — Indices de navegacion unificados: grid 2 columnas en las 3 paginas legales

| Archivo | Cambio |
|---|---|
| `apps/store/politica-privacidad.html` | Indice convertido de `<ul>` a `<div class="grid grid-cols-1 sm:grid-cols-2">` con links directos `text-sky-600`. Numeracion secuencial removida. |
| `apps/store/preguntas-frecuentes.html` | Indice convertido de pills `flex flex-wrap` (rounded-full, bg-slate-100) al mismo grid 2 columnas `text-sky-600` consistente con terminos y privacidad. |
| **Consistencia** | Las 3 paginas legales ahora comparten identico patron visual de indice. |

### Decisiones de Diseno Tomadas

- No implementar "Editar Venta" en el modal de historial. Las ventas CONFIRMADAS no se editan. Se usa el patron Void + Recreate (Anular + crear nueva). Esto preserva integridad de inventario, contabilidad y compliance DIAN.
- **Logo de empresa:** Se carga automaticamente desde `pos_configuracion_empresa.logo_url` en el header (14 paginas), login y factura. Sin modificar HTMLs individuales — la logica centralizada en `database.js` busca el contenedor por clase CSS y lo reemplaza. La IA futura debe mantener esta estrategia centralizada para cambios UI globales.
- **Sección de usuario en header:** Centralizada en `auth.js::poblarUserHeader()`. Cualquier página futura solo necesita agregar los IDs `#user-avatar`, `#user-name`, `#user-rol` en el header y se puebla automáticamente.
- **Header fixed vs sticky:** Se usa `position: fixed` porque el scroll container es un `flex-1 overflow-y-auto` hijo del body (no el body mismo). `sticky` no funcionaría por ser hermanos, no padre-hijo.
- **Modo oscuro default:** Se implementa con `class="dark"` directo en `<html>` + anti-flash script que lo remueve si localStorage dice `'false'`. El JS existente en cada página sigue funcionando para el toggle, pero la inicialización la maneja el script inline en el `<head>`.
- **Multi-variante con filas expandibles:** Los campos secundarios (precio_original, precio_mayorista, descuento_max, stock_min/max, peso, dimensiones) se editan en filas expandibles (▼) en vez de columnas fijas, para mantener la tabla compacta.
- **IA debe ejecutar `npx serve apps/pos` para pruebas:** No usar `file://` porque los fetch a Supabase y el manifest.json fallan por CORS.
- **Admin bypass de permisos en `tienePermiso()`:** El rol 'Administrador' siempre retorna `true` en `tienePermiso()` sin consultar DB, para garantizar que vea todas las pantallas aunque fallen los datos semilla de `pos_rol_permisos`.
- **Sidebar normalizado:** `caja.html` e `inventario.html` ahora tienen el sidebar completo con los 6 grupos (Ventas, Inventario, Compras, Clientes, Caja/Finanzas, Administracion) idéntico al de `ventas.html`.
- **IVA embebido en compras:** `precio_unitario` en orden de compra YA incluye IVA. Calculo: `totalConIva = cantidad * precio_unitario * (1 - descuento%)`, luego `subtotal = totalConIva / (1 + tasa)`, `impuesto = totalConIva - subtotal`, `total = totalConIva`. `tasa_impuesto` en DB es decimal (0.19 para 19%) — NO dividir entre 100.
- **Cards separadas en compras:** La pagina `compras.html` tiene 4 cards `<details>` independientes: Datos del Proveedor, Catalogo de Productos, Productos en la Orden, Lista de Ordenes. Cada una colapsable individualmente para mejor usabilidad.
- **Modal imagen producto via dblclick + icono:** En desktop, doble clic en nombre del producto en catalogo abre modal con imagen. En mobile (dblclick no existe), icono SVG de imagen siempre visible al lado del nombre. Imagen via `DB.productosMultimedia.listar(productoId)` con filtro `tipo === 'imagen'`.
- **Filtros combinados client-side:** Los 3 filtros de Card 4 (texto, proveedor dropdown, estado dropdown) operan 100% client-side sobre el array `COMPRAS`. No hay llamadas extra a DB.
- **Botones en flujo normal (sin fixed) en todas las paginas CRUD:** Los botones de accion (Limpiar/Guardar) estan en flujo normal dentro del `max-w-7xl`, justo despues del ultimo `<details>` card. NO usan `position: fixed`. Esto garantiza que todo el contenido sea accesible via scroll natural sin overlap, igual que en `ventas.html`. El patron es: `<div class="flex flex-col sm:flex-row gap-3 pt-2">` con botones `flex-1 py-3.5`. Sin `pb-20`, sin `z-30`, sin `fixed bottom-0`. La IA futura debe replicar este patron en cualquier pagina CRUD nueva. La clase `.content-actions-pb` en `estilo.css` existe como utilidad historica pero no se usa activamente.
- **Icon-only action columns:** Todos los botones de accion (Ver, Editar, Eliminar) en todas las paginas POS son icon-only (SVG + aria-label). No hay texto visible. Esto garantiza que en mobile las columnas de accion ocupen el minimo espacio necesario. Los iconos siguen el patron: pencil (Editar), trash (Eliminar), eye (Ver), con colores sky-500 (editar) y red-400 (eliminar).
- **KPI Bar en ventas.html:** Los indicadores del dia (Ventas Hoy, Total Hoy, Promedio) se renderizan como barra compacta de 30px entre el header y el formulario, NO como cards. Esto evita romper el patron `<details>` colapsable y no compite visualmente con los botones de canal. La actualizacion es inmediata post-venta (sin cache, query agregado PostgREST que devuelve 1 fila). Fallback silencioso a `—` si la API falla.
- **Codigo interno en modal de historial:** Se renderiza condicionalmente via `<span class="text-xs text-slate-400 font-mono w-20 truncate">` solo si `d.detalle.codigo_interno` existe. Sin cambios en HTML ni DB porque `sm:max-w-4xl` (896px) ya tiene espacio y los datos ya vienen en el join existente de `database.js`.
- **Store checkout sin Edge Functions:** El modulo Store NO usa Supabase Edge Functions. El flujo de checkout (`checkout.js`) opera 100% via REST API directa a PostgREST usando `__supabase.post()` y `__supabase.get()`, con la anon key. Requiere grants INSERT + RLS policies para rol `anon` en `pos_clientes`, `st_direcciones`, `st_pedidos` y `st_pedidos_detalle`. Ver `specs/seed-anon-grants-store.sql`. El `canal_id` se obtiene consultando `pos_canales_venta` donde `codigo = 'web'`.
- **Tags de producto como text[] con toggle chips:** `pos_productos.tags` es un array `text[]` con GIN index. En el POS se seleccionan via toggle chips (no free text) para garantizar lowercase exacto. Los valores validos son: `nuevo`, `destacado`, `oferta`, `super-oferta`, `remate`, `mas_vendido`, `liquidacion`, `imperdible`, `agotado`.
- **Badge system del Store:** Los tags de producto se renderizan como badges visuales en las cards del catalogo. La funcion `obtenerBadges()` en `card-producto.js` itera `producto.tags[]` y mapea cada tag a un badge con icono y color CSS. Los badges se apilan verticalmente (`flex-col gap-1.5`). La prioridad "Agotado" oculta los demas badges. Los tags `oferta`, `super-oferta` y `remate` se agrupan bajo un unico badge "Oferta". Los tags deben coincidir EXACTAMENTE en lowercase con `badgeMap` en `card-producto.js:5-13`. **Stock check:** `obtenerBadges()` calcula `stockTotal` sumando `variantes[].stock` (multi-variante) o usando `producto.stock` (variante unica). Si stock ≤ 0, badge "Agotado" es prioritario sobre cualquier otro.
- **Tags lowercase obligatorio en DB:** El `data-tag` en chips POS usa minusculas. Los tags se almacenan exactamente asi en `pos_productos.tags[]`. El Store filtra y mapea comparando con `badgeMap` usando `tags.indexOf('destacado')` — cualquier diferencia de case rompe el badge. Los 3 chips de oferta son: `nuevo`, `destacado`, `oferta`. Ademas hay chips adicionales: `mas_vendido`, `liquidacion`, `imperdible`.
- **Navbar fixed en Store vs sticky:** Se usa `position: fixed` en vez de `sticky` porque Tailwind CDN no siempre procesa correctamente clases CSS en contenido inyectado via JavaScript (`innerHTML`). `position: fixed` es universalmente soportado y no depende del MutationObserver del CDN. Se compensa con `pt-14` (56px = altura del navbar `h-14`) en el `<main>` de cada página.
- **Favicon SVG en Store:** Las 8 páginas HTML del Store usan `<link rel="icon" type="image/svg+xml" href="img/icon.svg">`. SVG es soportado como favicon en navegadores modernos (Chrome, Firefox, Edge, Safari 14+). No se generan versiones PNG ni ICO.
- **Store Lightbox 100% via JS:** El lightbox modal de galeria de producto se construye completamente via JavaScript (DOM creation, eventos, animaciones). No se modifica `producto.html`. La estructura sigue el mismo patron que `abrirVideoModal()` existente: crear overlay, toolbar, contenido, adjuntar al body, limpiar al cerrar.
- **Scope de funciones en producto.js:** Todas las funciones de la pagina de producto (`renderizarProducto`, `abrirLightbox`, `abrirVideoModal`, `renderizarRelacionados`) estan declaradas **dentro** del callback `DOMContentLoaded`. Esto es obligatorio porque `renderizarProducto` y las funciones del lightbox comparten variables de clausura (`_lightboxImagenes`, `_lightboxIndice`, `_autoplayTimer`, `_autoplayActivo`, `_tiempoFuera`). Cualquier funcion futura que acceda a estas variables debe estar en el mismo scope.
- **Crossfade CSS vs slide:** La transicion entre imagenes del lightbox usa crossfade CSS (`.desvanecer` con `opacity 0.3s ease`) en vez de slide/translate. Es mas simple, ligero y evita problemas de layout con imagenes de distintas proporciones. La logica: agregar clase `.desvanecer` → wait 300ms (via `setTimeout`) → cambiar `img.src` → remover clase `.desvanecer`.
- **Autoplay automatico al abrir el lightbox:** El autoplay arranca inmediatamente al abrir el modal (`abrirLightbox()` llama `iniciarAutoplay()` al final). Usa `setInterval` de 3s. Al navegar (flechas, dots, swipe, teclado) se pausa temporalmente via `pausarAutoplayTemporal()`: limpia el intervalo actual y programa uno nuevo con `setTimeout` a 3s. Esto evita que la imagen cambie inmediatamente despues de que el usuario interactuo. No inicia si hay 1 sola imagen (guard `if (_lightboxImagenes.length <= 1) return;`).
- **Eventos del lightbox con cleanup:** Los eventos de teclado (`keydown`) y touch (`touchstart`/`touchend`) se limpian via `MutationObserver` que detecta cuando el overlay ya no esta en el DOM. Esto evita memory leaks y listeners huerfanos.
- **cursor-pointer condicional en imagen principal:** No se pone `cursor-pointer` en el HTML estatico de `producto.html`. Se agrega via JS (`classList.add('cursor-pointer')`) solo cuando `_lightboxImagenes.length > 1`, es decir, cuando hay mas de una imagen y el lightbox tiene sentido abrirse al hacer click. Si solo hay 1 imagen, el cursor queda como default (arrow) porque hacer click no hace nada.
- **Click-outside cierra lightbox:** El handler de clic del overlay cierra el modal cuando se hace clic en cualquier elemento que NO sea la imagen (`.lightbox-imagen`), flechas (`.lightbox-arrow`), dots (`.lightbox-dot`), boton autoplay (`.lightbox-btn`) o boton cerrar (`.lightbox-close`). Es el comportamiento estandar de Fancybox, GLightbox y Photoswipe. El usuario puede cerrar tocando el fondo negro, el padding alrededor de la imagen, el toolbar vacio o el area de dots.
- **Store SW con ES_LOCAL bypass:** El service worker del Store detecta `self.location.hostname === 'localhost'` o `'127.0.0.1'` y hace `return;` sin `e.respondWith()` en fetch, y omite precache en install/activate. Esto permite que `npx serve` funcione sin interferencia del SW (los 301 redirects los maneja el navegador directamente).
- **SW auto-reload via postMessage obligatorio:** Al activarse el SW, debe enviar `{accion:'recargar'}` a todos los clients via `clients.matchAll()` + `postMessage()`. Cada pagina HTML debe escuchar `navigator.serviceWorker.addEventListener('message', ...)` y ejecutar `location.reload()`. El usuario siempre ve la version mas reciente sin recarga manual. Esta decision aplica tanto a POS como a Store.
- **SW ignoreSearch:true para producto.html:** `caches.match(e.request, {ignoreSearch:true})` permite que el cache de `producto.html` (sin query) sirva para requests a `producto.html?slug=...`. Sin esto, el cache-first fallaria en todas las paginas de producto porque la URL del cache no coincide con la URL solicitada (difieren en query string).
- **SW .catch() obligatorio en fetch handler:** El fetch handler debe envolver la promesa en `.catch(() => fetch(e.request))`. Sin esto, si el cache falla o hay una redireccion, el SW lanza "A listener indicated an asynchronous response by returning true" y la pagina no carga.
- **SW cache versioning YYYYMMDD-NN:** El nombre del cache usa formato `kubit-pos-YYYYMMDD-NN` (POS) y `outletshop-YYYYMMDD-NN` (Store). `YYYYMMDD` = fecha del deploy, `NN` = contador por dia que se incrementa manualmente en cada deploy del mismo dia (01, 02...). Esto garantiza que cada deploy use un cache nuevo. El SW elimina caches viejos en el evento `activate`.
- **npx serve no funciona en Windows para el Store:** En Windows 10, `npx serve` hace un redirect 301 de `GET /producto.html?slug=...` → `GET /producto` (pierde query params). Este bug no tiene fix desde el codigo del proyecto. Usar `npx http-server apps/store -p 3000` o XAMPP como alternativa local.
- **producto.js try/catch obligatorio:** El callback `DOMContentLoaded` en `apps/store/js/paginas/producto.js` debe estar envuelto en `try/catch` porque si el SW sirve una version corrupta o incompleta del JS, la pagina se rompe silenciosamente. El catch muestra "Error al cargar el producto. Por favor, recarga la pagina." en el contenedor `#app`.
- **Footer compacto:** El pie de pagina del Store se diseno con brand y redes sociales en la misma fila, grid de 2 columnas en desktop (Enlaces + Contacto), acordeon compacto (`py-2`), padding reducido (`py-6 sm:py-8`) y la descripcion unificada con el copyright al final. Los iconos sociales usan `w-7 h-7` en mobile (vs `w-10 h-10` anterior). Sin contenido duplicado. Esto reduce la altura del footer ~50%.
- **Paginas legales con indice grid 2 columnas:** Las 3 paginas (terminos, privacidad, FAQ) usan el mismo patron de indice: tarjeta blanca con `<div class="grid grid-cols-1 sm:grid-cols-2">` y links `text-sky-600`. Sin listas `<ul>`, sin chips `rounded-full`. Consistencia visual garantizada.
- **Contenido legal migrado de pre-line a HTML semantico:** Tanto `terminos-condiciones.html` como `politica-privacidad.html` migraron de `white-space: pre-line` (un solo div de texto plano) a secciones HTML con `<section>`, `id` para anclajes, `scroll-mt-20` para navegacion suave, y estructura `<h3>` + `<ul>`/`<ol>` + `<p>`. Esto es esencial para escalabilidad, SEO y accesibilidad.
- **Compras del Mes en tiempo real en el Panel:** El KPI "Compras" del Dashboard (`panel.html`) no debe leer `pos_finanzas_mensuales.compras_total` (dato estatico que se desactualiza). En su lugar usa `DB.compras.totalDelMes()` que suma `pos_compras.total` del mes actual via PostgREST. Sin cache, filtro por `estado IN (RECIBIDA,PENDIENTE)`, soft-delete excluido. Usa `api.get()` directo (no `select()` helper) porque los operadores `in.()` e `is.null` no son compatibles con el query builder de `database.js`.

---

## 11. Palabras Clave de Búsqueda

| Para encontrar | Buscar |
|---|---|---|
| Specs del proyecto | `specs/`, `*-spec.md` |
| Modelo de datos | `02-database-schema.sql` |
| Diseño UI | `05-ui-ux-system.md` |
| Reglas del POS | `03-pos-spec.md` |
| Reglas del Store | `04-store-spec.md` |
| Memoria de IA | `AGENTS.md` |
| Código del POS | `apps/pos/` |
| Capa de datos (DatabaseService) | `apps/pos/js/compartido/database.js` |
| Código del Store | `apps/store/` |
| Auth (centralizada) | `apps/pos/js/compartido/auth.js` (exporta `window.KubitAuth`) |
| Poblar header usuario | `auth.js::poblarUserHeader()`, busca IDs `user-avatar`, `user-name`, `user-rol` |
| Variantes de producto | `productos.js`: `toggleModoVariantes()`, `atributos jsonb`, `pos_productos_detalle` |
| Decisiones de diseño | `AGENTS.md` sección 5 |
| Seguridad credenciales | `AGENTS.md` sección 10 |
| Skills de IA | `.opencode/skills/`, `.claude/skills/` |
| Archivos informativos externos | `ArchivosInformativos/` |
| Glosario de dominio | `CONTEXT.md` |
| Codigo Compras | `apps/pos/js/paginas/compras.js` |
| Filtros en Ordenes de Compra | `filtrarYRender()`, `#filtro-proveedor`, `#filtro-estado` |
| Modal imagen producto | `abrirModalImagenProducto()`, `#modal-producto-imagen` |
| IVA en compras (tasa decimal) | `tasa_impuesto` es decimal (0.19), NO dividir entre 100 |
| Botones icon-only | `btn-editar`, `btn-eliminar`, `btn-ver`, SVG icons + aria-label |
| Barra fija inferior (removida) | ver `estilo.css` `.content-actions-pb` (historial), ya no se usa |
| Tipo Producto | `#campo-tipo-producto`, `<select>` Fisico/Digital/Servicio |
| Test suite | `tests/`, `npm test`, `vitest`, `setup.js` |
| Tests de calculo | `tests/calculos/`, `calculos-pos.js`, `compras.test.js`, `caja.test.js`, `productos.test.js` |
| Testing spec | `specs/13-testing-model.md` |
| Store badges | `card-producto.js::obtenerBadges()`, `apps/store/css/estilo.css` clases `.badge-*` |
| Tags de producto (POS) | `productos.html` toggle chips, `productos.js::leerTagsDesdeChips()` |
| Tags en DB | `pos_productos.tags text[]`, lowercase obligatorio |
| Mapeo tag→badge | `card-producto.js::badgeMap`, `card-producto.js::ofertaTags` |
| Navbar Store | `navbar-store.js` (se inyecta en `<div id="navbar">`) |
| Navbar fixed | `navbar-store.js`: `fixed top-0 left-0 right-0 z-50 w-full` + `pt-14` en `<main>` |
| Favicon Store | `apps/store/*.html`: `<link rel="icon" type="image/svg+xml" href="img/icon.svg">` |
| Iconos Store | `apps/store/img/icon.svg` (complejo), `icon2.svg` (minimalista bolsa) |
| Store checkout (REST) | `checkout.js`, `__supabase.post()`, 7 operaciones secuenciales (canal, cliente, direccion, pedido, detalle) |
| Grants anon Store | `specs/seed-anon-grants-store.sql`, `pos_clientes`, `st_direcciones`, `st_pedidos`, `st_pedidos_detalle` |
| POS PWA service worker | `apps/pos/service-worker.js`, skipWaiting, clients.claim, cache-first, rutas relativas |
| POS iOS meta tags | `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, apple-touch-icon, 17 paginas |
| POS SW registration | `navigator.serviceWorker.register`, 17 paginas POS |
| POS manifest categories | `apps/pos/manifest.json`, `categories: ["business","finance","shopping"]` |
| Store scrollbar categorias | `apps/store/css/estilo.css`, `.menu-categorias`, `overflow-x-auto` |
| Store checkout ciudad | `checkout.js`, `#input-ciudad`, `<datalist>`, colombia.js, filtro por departamento |
| Badge mas_vendido | `card-producto.js::badgeMap`, key `mas_vendido` con guion bajo |
| Badge imperdible | `card-producto.js::badgeMap`, `apps/store/css/estilo.css` `.badge-imperdible` |
| Badge nuevo | `card-producto.js::badgeMap`, `apps/store/css/estilo.css` `.badge-nuevo` |
| Correo transaccional (post-MVP) | `specs/06-servicio-correo.md`, Resend, Edge Function send-mail, postergado |
| Canales dinamicos POS | `pos_canales_venta.tipo` agrupa canales en `fisico`, `web_propio` o `marketplace`. Los marketplaces se renderizan dinamicamente desde DB en `<select>`. Costos visibles solo si `tipo === 'marketplace'`. |
| Canales dinamicos (renderizado) | `ventas.js`: `renderizarCanales()`, `renderizarMarketplaces()`, `seleccionarTipo()`, `seleccionarMarketplace()` |
| Service worker redirect fix | `fetch(e.request, { redirect: 'follow' })`, `if (r && !r.redirected) return r` en cache |
| Sidebar Stock label | Sidebar label "Stock" en vez de "Inventario" en 16 paginas POS |
| Deploy Vercel QA | `https://pos-calidad.vercel.app/` |
| KPI Bar ventas hoy | `ventas.html`, `cargarEstadisticas()`, `DB.ventas.estadisticasHoy()`, IDs `kpi-ventas-*` |
| Codigo interno en historial | `ventas-historial.js::abrirDetalle()`, `d.detalle.codigo_interno`, modal `sm:max-w-4xl` |
| Stats bar de Totales (carrito) | `actualizarStatsCarrito()`, IDs `stats-productos`, `stats-unidades`, `stats-ticket-prom` |
| Store producto agotado | `mapearProducto()` campo `stock`, `obtenerBadges()` fallback `producto.stock`, `agregarAlCarrito()` bloqueo stock ≤ 0 |
| Modal agotado Store | `card-producto.js::agregarAlCarrito()`, SVG bolsa tachada, mensaje "Producto agotado" |
| Lightbox Store | `producto.js::abrirLightbox()`, `estilo.css` clases `.lightbox-*`, lightbox fullscreen con autoplay, crossfade CSS, navegacion por flechas/dots/teclado/swipe |
| Lightbox scope fix | `producto.js`: todas las funciones dentro del callback DOMContentLoaded para compartir clausura con `_lightboxImagenes`, `_lightboxIndice`, `_autoplayTimer` |
| Lightbox CSS | `estilo.css` lineas 744-835: `.lightbox-overlay`, `.lightbox-toolbar`, `.lightbox-arrow`, `.lightbox-dot`, `.lightbox-imagen.desvanecer`, responsive |
| Lightbox autoplay (3s) | `iniciarAutoplay()` (3000ms), `pausarAutoplayTemporal()` (reanuda 3s), arranque automatico al abrir, guard `_lightboxImagenes.length <= 1` |
| Lightbox click-outside | `cerrarLightbox()` en overlay click, excluye `.lightbox-imagen`, `.lightbox-arrow`, `.lightbox-dot`, `.lightbox-btn`, `.lightbox-close` |
| Lightbox touch swipe | `touchstart`/`touchend` delta >50px, `passive: true` |
| Lightbox keyboard | `keydown` Escape/←/→, cleanup via MutationObserver |
| Lightbox cursor | `cursor-pointer` agregado via JS solo si mas de 1 imagen |
| Void + Recreate (Editar Venta) | `ventas.js::cargarEdicion()`, `ventas-historial.js::editarVenta()`, `database.js::anularConRevertir()`. Crear nueva venta PRIMERO, anular original solo si exito. sessionStorage `kubit_editar_venta` + query param `?editar=ID`. |
| anularConRevertir | `database.js::ventas.anularConRevertir(id, opts)`. Revierte stock (entrada_anulacion), finanzas mensuales (valores negativos), marca ANULADA. |
| cargarEdicion | `ventas.js::cargarEdicion(v)`. Puebla formulario ventas.html desde objeto venta completo: cliente, fecha, metodo_pago, referencia, vendedor, canal, costos, descuento global, carrito con items. |
| Store SW service worker | `apps/store/service-worker.js`, ES_LOCAL bypass, cache outletshop-YYYYMMDD-NN, postMessage auto-reload |
| Store SW registration | `navigator.serviceWorker.register`, 8 paginas Store |
| SW localhost bypass | `self.location.hostname === 'localhost'`, `return;` sin `e.respondWith()` |
| SW auto-reload | `postMessage({accion:'recargar'})`, `location.reload()` en listener |
| SW cache versioning | `kubit-pos-YYYYMMDD-NN` (POS), `outletshop-YYYYMMDD-NN` (Store) |
| SW ignoreSearch | `caches.match(e.request, {ignoreSearch:true})` para producto.html?slug=... |
| SW .catch() fetch handler | `.catch(() => fetch(e.request))` evita "listener indicated asynchronous response" |
| SW redirect fix | `!r.redirected`, `{ redirect: 'follow' }` para navegacion |
| npx http-server alternativa | `npx http-server apps/store -p 3000` evita bug 301 de `npx serve` en Windows |
| Store producto.js try/catch | `producto.js` DOMContentLoaded envuelto en try/catch, mensaje fallback si falla |
| Footer tagline Store | `footer-store.js`, Alternativa 4: "Productos fisicos y digitales con los mejores precios del mercado. Compras seguras, envios confiables y un equipo comprometido con tu satisfaccion." |
| Footer diseno compacto | `footer-store.js`: brand+social misma fila, grid 2 cols, padding reducido `py-6 sm:py-8`, altura ~50% menor |
| Equipo foto | `apps/store/sobre-nosotros.html`, `EquipoOutletShop.jpg`, grid lg:grid-cols-5, foto col-span-3 |
| FAQ categorizado | `preguntas-frecuentes.html`, 5 categorias (Pedidos, Envios, Pagos, Devoluciones, Soporte), 15 preguntas, indice, fecha actualizacion |
| Privacidad reestructurada | `politica-privacidad.html`, indice 9 anclajes, secciones HTML, base legal, conservacion 5 anos, cookies detalladas |
| Terminos reestructurados | `terminos-condiciones.html`, fix URL mitiendanube, indice 11 anclajes, legislacion Medellin, notificaciones legales |
| Paginas legales indice grid | `grid grid-cols-1 sm:grid-cols-2` en TOC de terminos, privacidad y FAQ, estilo `text-sky-600` unificado |
| Herramientas module | `herramientas.html`, `herramientas/`, `js/herramientas/` |
| Renombrar Archivos tool | `renombrar-archivos.html`, `renombrar-archivos.js`, File System Access API, `showDirectoryPicker` |
| Panel Dashboard | `panel.html`, `panel.js`, KPIs del Mes (finanzas mensuales), KPIs Operativos (ventas hoy/stock bajo) |
| Store URL desde DB | `configuracion.html#campo-store-url`, `cargarLinkTienda()` en `database.js`, `#link-tienda-virtual` en sidebar |
| Top 5 productos | `database.js::ventas.topProductos(limite)`, agregacion por `pos_ventas_detalle` del mes actual |
| Sidebar compartido | `js/compartido/sidebar.js`, `toggleSidebar()`, paginas no-CRUD |
| Action buttons patron | `#action-bar`, natural flow, `flex flex-col sm:flex-row gap-3`, show/hide contextual |
| Card visibility patron | `class="hidden"` (NUNCA `style="display:none"`) para elementos controlados por JS |
| Migracion V1→V2 | `ScriptMigracionDB/`, `14-migracion-datos.md` |
| Scripts INSERT migracion | `NN-migrate-<tabla>.sql` |
| Orden de migracion | `14-migracion-datos.md` §3, `AGENTS.md` §5 |
| Datos corruptos V1 | `cliente 21760f85`, `primer_apellido = Medellin` |
| Transformacion impuesto | `impuesto_default /100`, `19.00 → 0.19` |
| UUID admin V1 | `497a2c95-d707-4d5b-8b01-34257f3b0224` |
| Compras del Mes en tiempo real | `database.js::DB.compras.totalDelMes()`, `panel.js::cargarKpisMes()`, query en vivo a `pos_compras`, sin cache, filtro `estado IN (RECIBIDA,PENDIENTE)` |

## 13. Registro de Cambios (continuacion)

### 2026-06-22 — Panel Compras en Tiempo Real (Fase 18)

| Archivo | Cambio |
|---|---|
| `apps/pos/js/compartido/database.js` | Nuevo metodo `DB.compras.totalDelMes()`: suma `pos_compras.total` del mes en tiempo real via `api.get()` directo (operadores `in.()` e `is.null` no compatibles con `select()` helper). Sin cache. |
| `apps/pos/js/paginas/panel.js` | `f.compras_total || 0` reemplazado por `await DB.compras.totalDelMes(f.anio, f.mes)` en `cargarKpisMes()`. El KPI ahora refleja compras nuevas inmediatamente. |
| `tests/compartido/database.test.js` | 3 nuevos tests: suma correcta (229572), array vacio retorna 0, error de red retorna 0. |
| `AGENTS.md` | Seccion 7.2: Fase 18 agregada. Seccion 5: decision de diseno de compras en tiempo real. Seccion 11: keyword totalDelMes. |
| `specs/ARCHITECTURE.md` | Conteo de tests actualizado: 99 → 102. |
| **Tests** | `npm test` → 102 passed, 0 failures (99→102, +3 tests) |

### 2026-06-15 — Modulo Herramientas POS (Fase 15)

| Archivo | Cambio |
|---|---|
| `apps/pos/herramientas.html` | Nuevo: hub page con card grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), header/sidebar POS completo, referencia a `sidebar.js` |
| `apps/pos/herramientas/renombrar-archivos.html` | Nuevo: tool page con 3-card workflow (Seleccionar Carpeta, Vista Previa, Resultados) + action bar externa fuera de cards |
| `apps/pos/js/herramientas/renombrar-archivos.js` | Nuevo: logica completa con File System Access API (`showDirectoryPicker`), renombrado masivo, preview editable, estadisticas, toast system |
| `apps/pos/js/compartido/sidebar.js` | Nuevo: funcion `toggleSidebar()` compartida para paginas que no pertenecen a los 14 CRUD principales |
| `apps/pos/css/estilo.css` | Nuevas clases `.herramienta-card` con hover/focus/active states slate-800 |
| `apps/pos/ventas.html`...`apps/pos/configuracion.html` (14 paginas) | Grupo "Herramientas" insertado en sidebar entre "Caja y Finanzas" y "Administracion" |
| `apps/pos/herramientas/renombrar-archivos.html` | Fix: Cards 2 y 3 cambiadas de `style="display:none"` a `class="hidden"` + `open` para compatibilidad con `classList.remove('hidden')` |
| `apps/pos/herramientas/renombrar-archivos.html` | Fix: Botones de accion movidos fuera de cards a `#action-bar` en flujo natural (`flex flex-col sm:flex-row gap-3`), show/hide contextual |
| `apps/pos/herramientas/renombrar-archivos.html` | Fix: Agregado `<script src="../js/compartido/sidebar.js">` para reparar menu hamburguesa |
| `tests/` | Verificacion: `npm test` → 99 tests, 0 failures (5 suites) |

### 2026-06-17 — Void + Recreate (Edicion de Ventas) — Fase 16

| Archivo | Cambio |
|---|---|
| `apps/pos/js/compartido/database.js` | Nuevo metodo `ventas.anularConRevertir()`: obtiene detalles, revierte stock por item (entrada_anulacion via ajustarStock), revierte finanzas mensuales con valores negativos, marca venta como ANULADA |
| `apps/pos/ventas-historial.html` | Boton "Editar" agregado en modal footer entre "Anular Venta" e "Imprimir" |
| `apps/pos/js/paginas/ventas-historial.js` | Nueva funcion `editarVenta()`: guarda venta en sessionStorage (`kubit_editar_venta`), redirige a `ventas.html?editar=ID`. Boton habilitado solo para estados CONFIRMADA/PENDIENTE. |
| `apps/pos/js/paginas/ventas.js` | `init()` detecta query param `?editar=ID`, carga venta desde sessionStorage. `cargarEdicion()` puebla todo el formulario: cliente, fecha, metodo_pago, referencia, vendedor, canal, costos, descuento global, carrito completo. `procesarVenta()` ejecuta CREATE primero (nueva venta + stock + finanzas), luego VOID (anularConRevertir) solo si la creacion fue exitosa. |
| `apps/pos/ventas.html` | `id="exito-titulo"` agregado al `<h3>` del modal de exito; cambia a "Venta Editada" via JS segun contexto |
| `apps/pos/AGENTS.md` | Documentacion actualizada: decision de diseno (seccion 5), completado (seccion 7.2), palabras clave (seccion 11), registro de cambios (seccion 13) |
| `specs/03-pos-spec.md` | Politica de edicion actualizada: CREATE primero, solo VOID si exito (seccion 4.1.1) |
| `tests/` | Verificacion: `npm test` → 99 passed, 0 failures (5 suites) |

### 2026-06-17 — Panel Dashboard + Tienda Virtual + Store URL desde DB (Fase 17)

| Archivo | Cambio |
|---|---|
| `apps/pos/js/compartido/database.js` | Nueva funcion `cargarLinkTienda()` centralizada al final del IIFE: busca `#link-tienda-virtual`, asigna href desde `pos_configuracion_empresa.store_url`. Nuevo metodo `ventas.topProductos(limite)` que agrega ventas del mes agrupadas por producto. |
| `apps/pos/panel.html` | Nueva pagina dashboard POS con KPIs del Mes (ventas/gastos/compras/utilidad/margen), KPIs Operativos (ventas hoy/ticket prom./productos/stock bajo), Top 5 productos del mes, Accesos Rapidos. Sidebar completo con link Dashboard activo + Tienda Virtual link. |
| `apps/pos/js/paginas/panel.js` | Nueva logica: carga finanzas mensuales, estadisticas del dia, stock bajo, top 5 productos. Formato COP con puntos. Sin Chart.js — solo Tailwind + SVG icons. |
| `apps/pos/configuracion.html` | Campo `#campo-store-url` agregado en Card 1 (Datos de la Empresa) despues de Logo URL. |
| `apps/pos/js/paginas/configuracion.js` | `store_url` agregado en `cargarConfig()` y `obtenerDatosForm()`. |
| `specs/02-database-schema.sql` | Columna `store_url text` agregada en tabla `pos_configuracion_empresa` despues de `mensaje_legal`. |
| `apps/pos/*.html` (15 paginas) | Sidebar: grupo "Dashboard" agregado arriba de Ventas con link a `panel.html`. Tienda Virtual link (`#link-tienda-virtual`, `target="_blank"`) agregado en el area inferior del sidebar antes de Cerrar sesion. |
| `apps/pos/herramientas/renombrar-archivos.html` | Sidebar actualizado con Dashboard link (`../panel.html`) y Tienda Virtual link. |
| `tests/` | Verificacion: `npm test` → 99 passed, 0 failures (5 suites) |

### 2026-06-22 — Migracion Fase 3: Ventas, Compras, Movimientos y Relink Gastos

| Archivo | Cambio |
|---|---|
| `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/10-migrate-ventas.sql` | Nuevo: migra 300 ventas + 318 detalle desde CSV V1. Canal hardcodeado MercadoLibre, metodo pago Transferencia. `producto_detalle_id` resuelto via subquery. Estados: `completada`→`CONFIRMADA` (298), `deleted_at`→`ANULADA` (2). |
| `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/11-migrate-compras.sql` | Nuevo: migra 42 compras + 96 detalle desde CSV V1. Estados mapeados. |
| `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/12-migrate-movimientos.sql` | Nuevo: migra 446 movimientos de inventario desde CSV V1. Tipos mapeados `entrada`→`entrada_compra`, `salida`→`salida_venta`. |
| `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/08b-relink-ventas-gastos.sql` | **Regenerado.** Ya no usa temp table. Usa CTE con 298 pares `gasto_id ↔ venta_uuid` hardcodeados. |
| `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/_generar_fase3.py` | Nuevo: generador Python que lee CSVs y produce los 4 scripts con casts explicitos (`::uuid`, `::timestamptz`). |
| `AGENTS.md` | Seccion 5: 5 nuevas decisiones Fase 3. Seccion 7.3: Fase 3 completada. Seccion 7.5: scripts Fase 3 agregados. |
| `specs/14-migracion-datos.md` | Orden de migracion actualizado con Fase 2 y Fase 3. Checklist completo. |

### 2026-06-22 — 09c regenerado con deduplicacion y UUIDs deterministicos

| Archivo | Cambio |
|---|---|
| `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/09c-migrate-productos-digitales.sql` | **Regenerado.** Ahora usa UUIDs deterministicos v5 en las 3 tablas (pos_productos, pos_productos_detalle, pos_productos_multimedia). Se eliminaron los CTE y las tablas temporales — los UUIDs se generan en Python y se hardcodean en el SQL. **Deduplicacion:** 7 duplicados exactos omitidos (insercion unica), 4 duplicados cercanos renombrados con "(v2)". **Totales:** 196 productos (de 203 originales), 1756 imagenes, 196 videos. |

### 2026-06-19 — Migracion V1→V2: Spec, Scripts y Convenciones

| Archivo | Cambio |
|---|---|
| `specs/14-migracion-datos.md` | Nuevo: especificacion completa de migracion V1→V2 con analisis campo a campo de 8 tablas, orden de ejecucion por FK, transformaciones, datos problematicos y checklist |
| `specs/01-master-spec.md` | Mapa de artefactos actualizado: incluye los 4 scripts SQL (00-03), specs 13-14, ArchivosInformativos y ScriptMigracionDB |
| `AGENTS.md` | Seccion 3.1: directorio `ScriptMigracionDB/` agregado bajo ArchivosInformativos. Seccion 5: 5 nuevas decisiones de migracion (UUIDs preservados, datos corruptos, impuesto_default /100, orden FK). Seccion 7.3: pendientes de migracion separados en Fase 1 y Fase 2. Seccion 7.5: nuevo estado de documentacion de migracion. Seccion 9.2: nueva subseccion detallando ScriptMigracionDB. |
| `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/04-migrate-clientes.sql` | Nuevo: script INSERT para pos_clientes (5 registros con UUIDs preservados) |

### 2026-06-21 — Migration Scripts Productos (Fase 2): 09, 09b, 09c

| Archivo | Cambio |
|---|---|
| `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/09-migrate-productos-pos.sql` | Nuevo: migra 128 productos desde CSV V1 (productos_rows.csv) a pos_productos + pos_productos_detalle. UUIDs V1 preservados. tipo_producto='Fisico' (excepto CV001='Digital'). tasa_impuesto/100. precio_compra=0 si vacio. margen_ganancia=NULL si vacio (no recalcular). Sin multimedia en esta fase. |
| `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/09b-update-store-data.sql` | Nuevo: para 110 productos comunes (CSV+JSON): UPDATE descripcion desde JSON + INSERT multimedia (1068 imagenes + 110 videos) desde JSON.imagenes[] y JSON.video. Tipo 'imagen' con orden secuencial, tipo 'video' con orden=999. Requisito: 09 ejecutado primero. |
| `ArchivosInformativos/DespliegueProduccion/ScriptMigracionDB/09c-migrate-productos-digitales.sql` | Nuevo: migra 203 productos digitales (cursos CV-prefix + PooBasico + ProductoDigitalPremium) 100% desde JSON. CTE para INSERT pos_productos + pos_productos_detalle con UUID consistente. Categoria fija: Cursos Virtuales. Tipo Digital, tasa_impuesto=0, stock=999 simbolico. Multimedia: 1819 imagenes + 203 videos. Tabla temporal _v1_prod_digital_map para mapeo nombre→UUID. precio_venta pendiente de actualizar manualmente. |
