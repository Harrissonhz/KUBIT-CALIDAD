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
| Editar ventas confirmadas | NO permitido. Usar Void + Recreate (Anular + Nueva Venta). Patrón estándar POS |
| Header POS | `fixed top-0 left-0 right-0 z-30` en todas las páginas. El contenido tiene `pt-16` para compensar |
| Modo oscuro por defecto | Todas las páginas cargan con `class="dark"` en `<html>`. Anti-flash script: si localStorage dice `'false'` lo remueve |
| Sección de usuario en header | Centralizada en `auth.js::poblarUserHeader()`. Solo requiere los IDs `user-avatar`, `user-name`, `user-rol` en el HTML |
| IVA siempre visible | `tasa_impuesto` está fuera del toggle single/multi-variante, visible siempre |
| Multi-variante | Las variantes se guardan como N registros en `pos_productos_detalle` con `atributos jsonb`. Edición inline con filas expandibles (▼) |
| POS PWA service worker | Rutas relativas (`service-worker.js`) para compatibilidad local (`npx serve`) y Vercel. Precarga 38 assets (HTML, JS, CSS, imágenes). Cache-first con fallback network. |
| Tags de producto (chips) | 6 chips toggle en vez de input texto libre. `data-tag` en minúsculas estrictas. Almacenados como `text[]` en `pos_productos.tags`. Los valores deben coincidir EXACTAMENTE con `badgeMap` del Store. |
| Ciudad checkout Store | `<datalist>` filtrado por departamento desde `colombia.js` para reducir errores de escritura y garantizar consistencia con datos reales. |

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

### 7.3 Pendiente
- [ ] `06-academy-spec.md` — Especificación del módulo Academy (post-MVP)
- [ ] Agregar más categorías a la DB para poblar el menú del navbar
- [ ] Asignar tags en DB a productos existentes para poblar carrusel y badges (UI ya implementada en POS y Store)
- [x] Ejecutar DML `MigracionProductos.sql` en Supabase QA
- [x] **Fase 3:** Reemplazar datos mock de ventas con DatabaseService real (productos, clientes, ventas)
- [x] **Fase 4:** Reemplazar CAJAS_MOCK en caja.js con DatabaseService real
- [x] **Fase 5:** UI de Productos, Categorías e Inventario conectada a DB
- [x] **Refactor UI (Jun 2026):** Canal de Venta movido a header, Tarjeta Totales rediseñada a formato recibo full-width con barra de stats
- [x] **Fix bugs (Jun 2026):** Menú hamburguesa, subtotal en tiempo real, fondo modal post-venta
- [x] **Historial mejorado:** Modal más ancho (4xl), nombre producto vs UUID, canal visible
- [x] **Decisión CRUD:** No implementar "Editar Venta". Usar Void + Recreate
- [x] **Completado (Jun 2026):** Multi-variante — formulario con toggle single/multi, atributos dinámicos (color/talla/diseño), tabla editable inline, filas expandibles (▼) con precio_original, precio_mayorista, descuento_max, stock_min/max, peso, dimensiones
- [x] **Completado (Jun 2026):** IVA siempre visible fuera del toggle variantes, default 0% (Exento)
- [x] **Completado (Jun 2026):** Stock Min por defecto = 2 (single y multi-variante)
- [x] **Completado (Jun 2026):** Modo oscuro como default en todas las páginas con anti-flash script inline
- [x] **Completado (Jun 2026):** Header fixed (flotante) en todas las páginas + pt-16 en scroll container
- [x] **Completado (Jun 2026):** Sección de usuario (avatar/nombre/rol) visible en header de todas las páginas, centralizada via `auth.js::poblarUserHeader()`
- [x] **Completado (Jun 2026):** Slug collisions manejadas vía trigger DB (sufijo numérico -1, -2...)
- [x] Ejecutar `specs/seed-permisos.sql` en Supabase QA (roles, permisos, rol_permisos)
- [x] **Fase 6:** UI de Clientes, Proveedores y Compras conectada a DB
- [x] **Fase 7:** UI de Facturación, Gastos, Configuración y Reportes conectada a DB
- [x] **Store checkout**: Edge Function eliminada, REST API directa con 7 operaciones + seed-anon-grants-store.sql
- [x] **POS PWA**: Service worker reescrito, iOS meta tags + SW registration en 17 paginas, manifest categories
- [x] **Tags chips**: Input texto libre reemplazado por 6 toggle chips en productos.html
- [x] **Store badges**: Corregidos mas_vendido, nuevo, imperdible, oferta group
- [x] **Checkout fixes**: Departamento/Ciudad intercambiados, ciudad datalist, scrollbar, factura-print impuesto
- [x] **Tests**: 99 tests, 0 failures (verificado post-cambios)
- [ ] Integración con MercadoLibre (sincronizar productos y pedidos)
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
- **Store checkout sin Edge Functions:** El modulo Store NO usa Supabase Edge Functions. El flujo de checkout (`checkout.js`) opera 100% via REST API directa a PostgREST usando `__supabase.post()` y `__supabase.get()`, con la anon key. Requiere grants INSERT + RLS policies para rol `anon` en `pos_clientes`, `st_direcciones`, `st_pedidos` y `st_pedidos_detalle`. Ver `specs/seed-anon-grants-store.sql`. El `canal_id` se obtiene consultando `pos_canales_venta` donde `codigo = 'web'`.
- **Tags de producto como text[] con toggle chips:** `pos_productos.tags` es un array `text[]` con GIN index. En el POS se seleccionan via toggle chips (no free text) para garantizar lowercase exacto. Los valores validos son: `nuevo`, `destacado`, `oferta`, `super-oferta`, `remate`, `mas_vendido`, `liquidacion`, `imperdible`, `agotado`.
- **Badge system del Store:** Los tags de producto se renderizan como badges visuales en las cards del catalogo. La funcion `obtenerBadges()` en `card-producto.js` itera `producto.tags[]` y mapea cada tag a un badge con icono y color CSS. Los badges se apilan verticalmente (`flex-col gap-1.5`). La prioridad "Agotado" oculta los demas badges. Los tags `oferta`, `super-oferta` y `remate` se agrupan bajo un unico badge "Oferta". Los tags deben coincidir EXACTAMENTE en lowercase con `badgeMap` en `card-producto.js:5-13`.
- **Tags lowercase obligatorio en DB:** El `data-tag` en chips POS usa minusculas. Los tags se almacenan exactamente asi en `pos_productos.tags[]`. El Store filtra y mapea comparando con `badgeMap` usando `tags.indexOf('destacado')` — cualquier diferencia de case rompe el badge. Los 3 chips de oferta son: `nuevo`, `destacado`, `oferta`. Ademas hay chips adicionales: `mas_vendido`, `liquidacion`, `imperdible`.
- **Navbar fixed en Store vs sticky:** Se usa `position: fixed` en vez de `sticky` porque Tailwind CDN no siempre procesa correctamente clases CSS en contenido inyectado via JavaScript (`innerHTML`). `position: fixed` es universalmente soportado y no depende del MutationObserver del CDN. Se compensa con `pt-14` (56px = altura del navbar `h-14`) en el `<main>` de cada página.
- **Favicon SVG en Store:** Las 8 páginas HTML del Store usan `<link rel="icon" type="image/svg+xml" href="img/icon.svg">`. SVG es soportado como favicon en navegadores modernos (Chrome, Firefox, Edge, Safari 14+). No se generan versiones PNG ni ICO.

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
