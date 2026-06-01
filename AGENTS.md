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

### 7.3 Pendiente
- [ ] `06-academy-spec.md` — Especificación del módulo Academy (post-MVP)
- [ ] Agregar más categorías a la DB para poblar el menú del navbar
- [ ] Asignar tags (`destacado`, `oferta`, etc.) a productos para carrusel y badges
- [ ] Ejecutar DML `MigracionProductos.sql` en Supabase QA
- [x] **Fase 3:** Reemplazar datos mock de ventas con DatabaseService real (productos, clientes, ventas)
- [x] **Fase 4:** Reemplazar CAJAS_MOCK en caja.js con DatabaseService real
- [x] **Fase 5:** UI de Productos, Categorías e Inventario conectada a DB
- [ ] **Fase 6:** UI de Clientes, Proveedores y Compras conectada a DB
- [ ] **Fase 7:** UI de Facturación, Gastos, Configuración y Reportes conectada a DB
- [ ] Crear Edge Function para `create-venta` que valide stock, descuente inventario y registre venta multi-canal
- [ ] Integración con MercadoLibre (Edge Function para sincronizar productos y pedidos)

### 7.4 Próximo Paso Recomendado
**Fase 6:** UI de Clientes, Proveedores y Compras conectada a DB.

---

## 8. Convenciones de Código (Resumen — Pendiente de detallar en `10-codex.md`)

- **JavaScript:** camelCase (`calcularTotal`), clases PascalCase
- **HTML:** kebab-case para IDs y clases (`btn-cobrar`, `modal-cliente`)
- **Archivos:** kebab-case (`perfil-cliente.js`, `lista-productos.html`)
- **Comentarios:** En español, solo cuando expliquen el "por qué", no el "qué"
- **Tailwind:** Preferir clases de utilidad sobre CSS personalizado
- **Componentes:** Un archivo por componente/funcionalidad
- **Importaciones:** Evitar dependencias externas. Preferir vanilla JS

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
| Decisiones de diseño | `AGENTS.md` sección 5 |
| Seguridad credenciales | `AGENTS.md` sección 10 |
| Skills de IA | `.opencode/skills/`, `.claude/skills/` |
| Archivos informativos externos | `ArchivosInformativos/` |
| Glosario de dominio | `CONTEXT.md` |
