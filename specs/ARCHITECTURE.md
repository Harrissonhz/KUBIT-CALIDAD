# Arquitectura del Proyecto Kubit

## 1. Estructura de Directorios (Actual)

```
/
├── AGENTS.md                     ← Memoria de IA (universal, fuente de verdad para decisiones)
├── CLAUDE.md                     ← Copia de AGENTS.md (compatibilidad Claude Code)
├── CONTEXT.md                    ← Glosario de dominio del proyecto
├── README.md
│
├── specs/                        ← Spec-Driven Development: fuente de verdad
│   ├── 01-master-spec.md         ← Visión general, branding, reglas del SaaS
│   ├── 02-database-schema.sql    ← DDL completo (35 tablas con grants, RLS, índices, triggers)
│   ├── 03-pos-spec.md            ← Especificación del módulo POS
│   ├── 04-store-spec.md          ← Especificación del módulo Tienda Virtual
│   ├── 05-ui-ux-system.md        ← Sistema de diseño UI/UX
│   ├── 06-servicio-correo.md     ← Correo transaccional con Resend (POST-MVP)
│   ├── 10-codex.md               ← Convenciones de código del proyecto
│   ├── 11-api-contracts.md       ← Contratos de API (REST + RPCs)
│   ├── 12-roadmap.md             ← Pendiente
│   ├── 13-testing-model.md       ← Modelo de testing automático
│   ├── ARCHITECTURE.md           ← Este archivo
│   ├── seed-anon-grants-store.sql← Grants y RLS para rol anon (Store)
│   └── seed-permisos.sql         ← Seed de roles y permisos
│
├── apps/
│   ├── pos/                      ← Módulo POS (Point of Sale)
│   │   ├── index.html            ← Redirección a login.html
│   │   ├── login.html            ← Login con Supabase Auth
│   │   ├── panel.html            ← Dashboard principal
│   │   ├── ventas.html           ← Registro de ventas
│   │   ├── ventas-rapido.html    ← Modo mostrador (split panel)
│   │   ├── ventas-historial.html ← Historial de ventas + modal detalle
│   │   ├── facturacion.html      ← Facturación electrónica DIAN
│   │   ├── productos.html        ← CRUD productos (multi-variante)
│   │   ├── categorias.html       ← CRUD categorías
│   │   ├── inventario.html       ← Dashboard de stock
│   │   ├── compras.html          ← Órdenes de compra
│   │   ├── proveedores.html      ← CRUD proveedores
│   │   ├── clientes.html         ← CRUD clientes
│   │   ├── caja.html             ← Apertura/cierre de caja
│   │   ├── gastos.html           ← CRUD gastos
│   │   ├── reportes.html         ← Reportes financieros
│   │   ├── configuracion.html    ← Configuración de empresa
│   │   ├── herramientas.html     ← Hub de herramientas
│   │   ├── factura-print.html    ← Vista de impresión de factura
│   │   ├── vercel.json           ← Rewrite rules para Vercel
│   │   ├── manifest.json         ← PWA manifest
│   │   ├── service-worker.js     ← Service Worker (cache-first)
│   │   ├── css/
│   │   │   └── estilo.css        ← Estilos globales POS
│   │   ├── js/
│   │   │   ├── config.js         ← Credenciales Supabase (QA)
│   │   │   ├── supabase.js       ← Cliente REST API Supabase
│   │   │   ├── compartido/
│   │   │   │   ├── database.js   ← DatabaseService (CRUD genérico + entity-specific)
│   │   │   │   ├── auth.js       ← Autenticación (login/sesión/permisos)
│   │   │   │   └── sidebar.js    ← toggleSidebar() compartido
│   │   │   ├── paginas/
│   │   │   │   ├── panel.js
│   │   │   │   ├── ventas.js
│   │   │   │   ├── ventas-rapido.js
│   │   │   │   ├── ventas-historial.js
│   │   │   │   ├── facturacion.js
│   │   │   │   ├── productos.js
│   │   │   │   ├── categorias.js
│   │   │   │   ├── inventario.js
│   │   │   │   ├── compras.js
│   │   │   │   ├── proveedores.js
│   │   │   │   ├── clientes.js
│   │   │   │   ├── caja.js
│   │   │   │   ├── gastos.js
│   │   │   │   ├── reportes.js
│   │   │   │   ├── configuracion.js
│   │   │   │   └── login.js
│   │   │   └── herramientas/
│   │   │       └── renombrar-archivos.js ← Tool: File System Access API
│   │   └── img/
│   │       ├── icon.svg           ← Icono PWA
│   │       ├── icon-192x192.png   ← Icono Android 192px
│   │       └── icon-512x512.png   ← Icono Android 512px
│   │
│   └── store/                     ← Módulo Tienda Virtual
│       ├── index.html
│       ├── carrito.html
│       ├── checkout.html
│       ├── producto.html
│       ├── sobre-nosotros.html
│       ├── terminos-condiciones.html
│       ├── politica-privacidad.html
│       ├── preguntas-frecuentes.html
│       ├── factura-print.html
│       ├── service-worker.js     ← Store SW (outletshop-YYYYMMDD-NN)
│       ├── manifest.json
│       ├── css/
│       │   └── estilo.css
│       ├── js/
│       │   ├── compartido/
│       │   │   ├── navbar-store.js
│       │   │   ├── footer-store.js
│       │   │   ├── card-producto.js
│       │   │   ├── colombia.js
│       │   │   └── supabase-client.js
│       │   ├── api/
│       │   │   ├── productos.js
│       │   │   ├── categorias.js
│       │   │   └── supabase-client.js
│       │   └── paginas/
│       │       ├── inicio.js
│       │       ├── producto.js
│       │       ├── carrito.js
│       │       └── checkout.js
│       └── img/
│           ├── icon.svg
│           ├── icon2.svg
│           └── EquipoOutletShop.jpg
│
├── tests/                         ← Suite de tests (vitest + jsdom)
│   ├── setup.js                   ← Setup global con mocks
│   ├── compartido/
│   │   ├── database.test.js       ← 59 tests (DB entidades)
│   │   └── auth.test.js           ← 8 tests (permisos)
│   ├── calculos/
│   │   ├── compras.test.js        ← 12 tests
│   │   ├── caja.test.js           ← 10 tests
│   │   └── productos.test.js      ← 10 tests
│   └── helpers/
│       └── calculos-pos.js        ← Funciones puras (IVA, descuento, formato)
│
├── .opencode/                     ← Skills para OpenCode CLI
│   └── skills/
│       ├── deploy-to-vercel/
│       ├── improve-codebase-architecture/
│       ├── kubit-codex/
│       ├── kubit-pos/
│       ├── kubit-store/
│       ├── kubit-ui/
│       ├── requesting-code-review/
│       ├── supabase-postgres-best-practices/
│       └── tdd/
│
├── .claude/                       ← Skills para Claude Code (mismos que .opencode)
│   └── skills/
│       └── ...
│
├── supabase/                      ← Configuración de Supabase
│   └── config.toml               ← Proyecto Supabase local
│
├── vitest.config.js               ← Configuración de vitest
└── package.json                   ← Dependencias (vitest, jsdom)
```

## 2. Principios Arquitectónicos

### 2.1 Zero-Framework Frontend
- Sin React, Vue, Angular ni SPA frameworks
- HTML semántico + Tailwind CSS (via CDN) + JavaScript vanilla
- Cada página es un HTML standalone con su propio JS IIFE
- Navegación tradicional (links `<a href>`, no router)

### 2.2 DatabaseService (database.js)
- Único punto de acceso a datos para todo el POS
- Patrón: IIFE que expone `window.DB` con métodos entity-specific
- Caché en memoria con `Map` (30s default)
- CRUD genérico: `select()`, `insert()`, `update()`, `softDelete()`
- Paginación y búsqueda integradas

### 2.3 Autenticación (auth.js)
- `window.KubitAuth` — objeto global con sesión, permisos, usuario activo
- Flujo: login → cargarSesion → aplicarRestriccionesUI
- Permisos basados en roles (RBAC) con patron `modulo.recurso.accion`
- Admin bypass: retorna `true` siempre

### 2.4 Spec-Driven Development
- `specs/` es la fuente de verdad. Todo cambio debe documentarse primero en specs
- `AGENTS.md` es la memoria ejecutiva (decisiones, keywords, changelog)
- Las skills `.opencode/skills/` y `.claude/skills/` contienen instrucciones especializadas

### 2.5 Capa de Datos: REST Directa vs Edge Functions
- POS: 100% REST API directa a Supabase (PostgREST) via `supabase.js`
- Store: 100% REST API directa via `supabase-client.js`
- Sin Edge Functions en producción. El checkout usa 7 operaciones REST secuenciales

### 2.6 Testing
- vitest + jsdom para tests unitarios y de integración
- 102 tests en 5 suites (database, auth, compras, caja, productos)
- Mocks de `window.__supabase`, `window.KubitAuth`, `localStorage` en `tests/setup.js`

## 3. Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML + Tailwind CSS (CDN) + JS vanilla (IIFE) |
| Backend/Database | PostgreSQL 15+ via Supabase (plan gratuito) |
| API | Supabase Data API (PostgREST) |
| Auth | Supabase Auth (email/password) |
| Hosting | Vercel (plan gratuito) |
| Testing | vitest + jsdom |
| PWA | manifest.json + service-worker.js |
| Imágenes | URLs en DB, contenido en repositorio separado GitHub |
