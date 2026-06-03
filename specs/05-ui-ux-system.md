# Sistema de Diseño de UI/UX - Kubit Suite

Este documento rige la interfaz visual y el comportamiento en dispositivos de todo el ecosistema Kubit.

## 1. Filosofía Visual y Modos
- **Estilo:** Ultra-minimalista, limpio y corporativo (Estilo Apple).
- **Enfoque de Color:** Monocromático de alto contraste (Negro Puro). Preparado nativamente para inversión de color (Dark Mode).

## 2. Paleta de Colores Oficial (Tailwind CSS)

### A. Modo Claro (Por Defecto)
- Fondo de la App: `bg-slate-50` (#F8FAFC)
- Contenedores/Tarjetas: `bg-white` (#FFFFFF)
- Texto Principal: `text-slate-950` (#020617)
- Texto Secundario/Labels: `text-slate-500` (#64748B)
- Botón Principal: `bg-slate-950 text-white hover:bg-slate-800`
- Bordes y Separadores: `border-slate-200/60`

### B. Modo Oscuro (Implementado desde Fase 1)
- Fondo de la App: `dark:bg-slate-950`
- Contenedores/Tarjetas: `dark:bg-slate-900`
- Texto Principal: `dark:text-white`
- Texto Secundario: `dark:text-slate-400`
- Botón Principal: `dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100`
- Bordes y Separadores: `dark:border-slate-800`
- Toggle con botón en navbar, persistencia en `localStorage('darkMode')`
- Aplicado en todas las pantallas del POS mediante clase `dark` en `<html>`

## 3. Adaptabilidad (Responsivo Mobile-First)
- Toda interfaz debe ser completamente funcional en pantallas táctiles desde 360px de ancho (celulares estándar) hasta pantallas de escritorio.
- El POS debe priorizar una visualización cómoda en Tablets (orientación horizontal) y Celulares para facilitar el cobro en mostrador o en movimiento.
- Se utilizarán exclusivamente las clases de quiebre de Tailwind (`sm:`, `md:`, `lg:`) para reordenar los elementos en móviles sin duplicar código.

## 4. Layout del POS (Opción Híbrida C)
- **Desktop (lg+):** Split-panel horizontal. Panel izquierdo (flex-1 ~60%): grilla de productos. Panel derecho (380-420px fijo): carrito de compras visible permanentemente.
- **Mobile/Tablet (< lg):** Panel único con grilla de productos + barra inferior flotante con total y botón "Cobrar". Al presionar la barra o "Cobrar" se abre un Bottom Sheet con el carrito completo.
- **Bottom Sheet:** Panel deslizante desde abajo, max-height 80vh, con handle visual, overlay semitransparente, animación CSS `translate-y-full` ↔ `translate-y-0`.
- **Modales:** Siempre centrados en desktop (sm:items-center) y anclados abajo en mobile (items-end) con border redondeado superior.

## 5. Capacidades PWA (Progressive Web App)

- El sistema incluirá un archivo `manifest.json` y un `service-worker.js` para permitir la instalación directa en dispositivos iOS, Android y Escritorio.
- Icono de la App: Logotipo minimalista de Kubit en SVG (compatible con PWA y favicon).
- Modo de visualización: `standalone` (oculta la barra de navegación del navegador web para simular una app nativa).

---

## 6. Patrón de Formularios POS (CRUD)

*Este patrón aplica a todas las páginas CRUD del POS (productos, categorías, clientes, proveedores, compras, gastos, configuración, reportes, etc.). NO aplica a `ventas.html` que mantiene su layout híbrido con pastillas/pills (Opción C).*

### 6.1 Estructura General

```
Page Layout
├── Navbar (header) — logo dinamico desde DB (pos_configuracion_empresa.logo_url), título, botón dark mode, hamburguesa
├── Sidebar (nav) — accordion `<details>` agrupado con links
├── Overlay (div#sidebar-overlay) — fondo semitransparente en mobile
└── Contenido (div flex-1 overflow-y-auto)
    ├── Cards colapsables (details.grupo-card)
    │   ├── Card 1 — Información General
    │   ├── Card 2 — Datos Específicos
    │   ├── Card 3 — Items/Lista (si aplica)
    │   └── ...
    └── Botones de acción (fuera de cards)
        ├── btn-limpiar-form (outlined)
        └── btn-guardar (filled primary)
```

- Layout ancho completo: `max-w-7xl mx-auto p-4 sm:p-6 space-y-4`
- Cada sección del formulario es un `<details class="grupo-card bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl" open>`
- El `summary` contiene: SVG icono (16x16, `text-slate-400`) + título (`text-sm font-semibold text-slate-700 dark:text-slate-300`) + `svg.chevron`
- El `summary` tiene `user-select: none; cursor: pointer` y `hover:bg-slate-50 dark:hover:bg-slate-800/50`
- Al abrirse, el chevron rota 180° vía CSS: `.grupo-card[open] summary svg.chevron { transform: rotate(180deg); }`
- Los íconos SVG se extraen de [Heroicons outline](https://heroicons.com/outline)

### 6.2 Sistema de Grid

Todos los campos dentro de un card usan:

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
```

Reglas de espaciado:
- **Campo ancho completo:** `sm:col-span-2 lg:col-span-4`
- **Pares lógicos** (ej: Categoría + Tipo, Marca + Modelo): `sm:col-span-2 lg:col-span-2`
- **Columnas individuales** (ej: stock, precio): col-span por defecto (1 col en lg)
- **Separador visual** entre grupos dentro del mismo card: `<div class="sm:col-span-3 lg:col-span-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-1"></div>`

### 6.3 Labels e Inputs

| Elemento | Clase | Estilo |
|---|---|---|
| **Label** | `.label-campo` | `font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #475569 (slate-600); .dark { color: #cbd5e1 (slate-300) }` |
| **Input/Select/Textarea** | `.input-campo` | `width: 100%; padding: 0.625rem 0.875rem; border-radius: 0.75rem; bg: #fff; border: 1px solid #e2e8f0; color: #020617; font-size: 0.875rem; .dark { bg: #1e293b; border: #334155; color: #f1f5f9 }` |
| **Input con prefijo $** | `.input-campo.pl-8` + `<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>` |
| **Input con sufijo %** | `.input-campo` + `<span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>` |
| **Read-only** | `.input-campo.bg-slate-50.dark:bg-slate-800/50` |
| **Checkbox** | `<label class="inline-flex items-center gap-2.5 cursor-pointer select-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"><input type="checkbox" class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-950"> <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Texto</span></label>` |

Los labels SIEMPRE van antes del input, NUNCA como placeholder.

### 6.4 Cards Colapsables — Anatomy

```html
<details class="grupo-card bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl" open>
  <summary class="flex items-center gap-3 px-5 py-4 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-semibold transition-colors cursor-pointer select-none">
    <svg class="w-5 h-5 shrink-0 text-slate-400"><!-- Heroicon --></svg>
    <span class="flex-1">Nombre del Card</span>
    <svg class="chevron w-4 h-4 transition-transform duration-200 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
    </svg>
  </summary>
  <div class="px-5 pb-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
      <!-- campos aquí -->
    </div>
  </div>
</details>
```

Orden típico de cards:
1. **Información General** — nombre, tipo, categoría, descripción, activo
2. **Precios / Valores** — precios, costos, impuestos, descuentos
3. **Detalles Específicos** — según entidad (stock, multimedia, dirección, contacto)
4. **Lista / Items** — tabla paginada con búsqueda y filtros
5. **Más cards** según complejidad de la entidad

### 6.5 Paginación en Listas

La tabla de items dentro del último card usa paginación client-side:

```
Tabla (table.w-full.text-sm)
  └── thead con headers en uppercase
  └── tbody#entidad-tbody
div#entidad-empty (mensaje sin datos)
div#entidad-paginacion
  ├── span#pag-info "X–Y de Z"
  └── div#pag-controles
      ├── button#pag-prev "Anterior"
      └── button#pag-next "Siguiente"
```

- **10 items por página** (`PAGE_SIZE = 10`)
- Filtros (búsqueda + categoría) actúan sobre dataset completo, luego se pagina
- Al cambiar de página, el tbody recibe `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`
- Si no hay resultados: ocultar paginación, mostrar `div#entidad-empty`
- La paginación se renderiza con JS: `renderizarPaginacion()` actualiza `pag-info` y `pag-controles`

### 6.6 Botones de Acción

Van SIEMPRE fuera de los cards, al final del contenido:

```html
<div class="flex gap-2 justify-end">
  <button id="btn-limpiar-form" class="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
    Limpiar
  </button>
  <button id="btn-guardar" class="px-6 py-2.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-all">
    Guardar
  </button>
</div>
```

- `btn-limpiar-form`: outlined, resetea formulario a estado inicial
- `btn-guardar`: filled primary (slate-950), llama a la función de guardado
- Ambos con `rounded-xl`, `text-sm`, `font-medium`, `transition-all`
- En móvil: full-width apilados; en desktop: inline-flex con gap

### 6.7 Archivo de Estilo (estilo.css)

Las únicas reglas CSS personalizadas necesarias son:

| Selector | Propósito |
|---|---|
| `.label-campo` | Labels de formulario (bold, uppercase, tracking) |
| `.input-campo` | Inputs/selects/textareas (rounded-xl, border, focus) |
| `.grupo-sidebar summary::-webkit-details-marker` | Ocultar marcador nativo del sidebar |
| `.grupo-card summary::-webkit-details-marker` | Ocultar marcador nativo de cards |
| `.grupo-card[open] summary svg.chevron` | Rotar chevron al abrir |
| `.multimedia-row` | Transición para filas dinámicas |

**NO** se necesita CSS personalizado para: colores, espaciado, bordes, sombras, tipografía, responsive. Todo eso se hace con clases Tailwind.

### 6.8 Archivo JS — Estructura de Paginación

Variables globales en el IIFE de cada página:

```javascript
var PAGE_SIZE = 10;
var PAGINA = 1;
var LISTA_COMPLETA = [];    // datos sin filtrar
var LISTA_FILTRADA = [];    // datos después de aplicar filtros
```

Funciones requeridas:
- `renderizarTabla()` — toma `LISTA_FILTRADA[PAGINA]` y renderiza filas + llama a `renderizarPaginacion()`
- `renderizarPaginacion()` — actualiza `#pag-info` y `#pag-controles`, deshabilita Anterior/Siguiente en bordes
- `filtrarYRender()` — aplica filtros sobre `LISTA_COMPLETA`, resetea `PAGINA = 1`, llama a `renderizarTabla()`
- `irPagina(n)` — cambia página, llama a `renderizarTabla()`, hace scroll

---

## 8. Texto UI — ASCII Plano Obligatorio
Todo texto visible al usuario debe escribirse en **ASCII plano** (a-z, A-Z, 0-9) sin tildes, diéresis, eñes ni caracteres especiales. Esto elimina problemas de encoding (mojibake) entre navegadores, editores y servidores.

| Incorrecto | Correcto |
|---|---|
| `Facturación` | `Facturacion` |
| `Categorías` | `Categorias` |
| `Configuración` | `Configuracion` |
| `Teléfono` | `Telefono` |
| `Dirección` | `Direccion` |
| `Razón Social` | `Razon Social` |
| `Contraseña` | `Contrasena` |
| `Código` | `Codigo` |
| `Acción` | `Accion` |
| `Navegación` | `Navegacion` |
| `Administración` | `Administracion` |
| `Menú` | `Menu` |
| `sesión` | `sesion` |
| `código` | `codigo` |
| `Cédula` | `Cedula` |
| `Ciudadanía` | `Ciudadania` |
| `Extranjería` | `Extranjeria` |
| `Órdenes` | `Ordenes` |
| `Recepción` | `Recepcion` |
| `Público` | `Publico` |
| `Mínimo` | `Minimo` |
| `Máximo` | `Maximo` |
| `Método` | `Metodo` |
| `Electrónica` | `Electronica` |
| `Género` | `Genero` |
| `Términos` | `Terminos` |
| `Crédito` | `Credito` |
| `Límite` | `Limite` |
| `Período` | `Periodo` |
| `Descripción` | `Descripcion` |
| `Identificación` | `Identificacion` |
| `catálogo` | `catalogo` |
| `carácter` | `caracter` |
| `físico` | `fisico` |
| `raíz` | `raiz` |
| `Carrito vacío` | `Carrito vacio` |
| `Cerrar sesión` | `Cerrar sesion` |
| `Gestión` | `Gestion` |

Esta regla aplica a: títulos, labels, placeholders, menús, botones, toasts, mensajes de error, tablas y cualquier otro texto visible en la interfaz. Quedan exceptuados: URLs, API keys, datos del usuario ingresados con acentos (ej. nombre de un cliente), y strings internos no visibles.

---

## 7. Excepciones
- **ventas.html** — No sigue este patrón. Usa layout híbrido Opción C (split-panel desktop, bottom sheet mobile) con categorías como pastillas/pills. Definido en sección 4 de este documento.