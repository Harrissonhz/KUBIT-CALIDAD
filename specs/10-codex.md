# Codex - Convenciones de Código para IA - Kubit

## 1. Propósito
Este archivo define las convenciones de código que toda IA debe seguir al generar archivos en `/apps/`. Su objetivo es garantizar que **cualquier modelo de IA**, sin importar el contexto o entrenamiento, produzca código consistente, mantenible y predecible.

**Leer este documento completo antes de escribir cualquier línea de código en `apps/`.**

---

## 2. Estructura de Archivos por Módulo

Cada módulo (`pos`, `store`, `academy`) sigue exactamente esta jerarquía:

```
apps/pos/
├── index.html              ← Dashboard (página principal después del login)
├── login.html              ← Inicio de sesión
├── ventas.html
├── caja.html
├── productos.html
├── clientes.html
├── proveedores.html
├── compras.html
├── reportes.html
├── facturacion.html
├── css/
│   └── estilo.css          ← Solo para lo que Tailwind no cubre
├── js/
│   ├── supabase.js         ← Cliente Supabase (única instancia)
│   ├── auth.js             ← Login, logout, verificación de sesión
│   ├── compartido/         ← Código reutilizable entre páginas
│   │   ├── navbar.js       ← Barra de navegación
│   │   ├── modal.js        ← Modal genérico
│   │   ├── tabla.js        ← Tabla dinámica
│   │   ├── formulario.js   ← Helpers de formularios
│   │   └── utils.js        ← Formateo de moneda, fechas, etc.
│   └── paginas/            ← Lógica específica de cada página
│       ├── login.js
│       ├── ventas.js
│       ├── caja.js
│       ├── productos.js
│       ├── clientes.js
│       ├── proveedores.js
│       ├── compras.js
│       ├── reportes.js
│       └── facturacion.js
├── manifest.json
└── service-worker.js
```

El módulo `store/` sigue la misma estructura pero con su propio conjunto de páginas.

---

## 3. Plantilla de Página HTML

Toda página HTML sigue este patrón exacto:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nombre Página - Kubit POS</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="css/estilo.css">
</head>
<body class="bg-slate-50 text-slate-950">
  <div id="navbar"></div>
  <main id="app" class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
    <!-- Contenido específico de la página -->
  </main>

  <!-- Scripts compartidos primero -->
  <script src="js/supabase.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/compartido/navbar.js"></script>
  <script src="js/compartido/modal.js"></script>
  <script src="js/compartido/tabla.js"></script>
  <script src="js/compartido/formulario.js"></script>
  <script src="js/compartido/utils.js"></script>
  <!-- Script de página al final con type="module" -->
  <script type="module" src="js/paginas/nombre-pagina.js"></script>
</body>
</html>
```

Reglas:
- `lang="es"` siempre
- `viewport` con `width=device-width, initial-scale=1.0` siempre
- Tailwind vía CDN (`script` en `<head>`)
- Todos los `script` compartidos se cargan **sin** `type="module"` (no usan `import`)
- El script de la página se carga **con** `type="module"` al final del `<body>`
- Sin CSS inline. Sin `<style>` en el HTML

---

## 4. Convenciones de Nomenclatura

| Aspecto | Regla | Ejemplo Correcto | Ejemplo Incorrecto |
|---|---|---|---|
| **Variables JS** | `camelCase` | `const totalVenta = 0` | `const total_venta = 0` |
| **Funciones JS** | `camelCase` (verbo + sustantivo) | `function obtenerClientes()` | `function Clientes()` |
| **Clases JS** | `PascalCase` | `class GestorInventario` | `class gestor_inventario` |
| **Constantes** | `UPPER_SNAKE_CASE` | `const IVA_DEFAULT = 0.19` | `const ivaDefault = 0.19` |
| **HTML IDs** | `kebab-case` con prefijo de página | `btn-confirmar-venta` | `btnConfirmarVenta` |
| **HTML Clases** | `kebab-case` | `pos-modal`, `store-card-producto` | `posModal`, `storeCard` |
| **Archivos JS** | `kebab-case` | `lista-productos.js` | `listaProductos.js` |
| **Archivos HTML** | `kebab-case` | `detalle-venta.html` | `detalleVenta.html` |
| **Archivos CSS** | `kebab-case` | `estilo.css` | `main-styles.css` |

---

## 5. Convenciones de Código JavaScript

### 5.1 Tamaño y Estructura
- Máximo **30 líneas por función**. Si una función supera este límite, debe refactorizarse en funciones más pequeñas.
- Una función = una responsabilidad. No mezclar lógica de negocio con manipulación del DOM.
- Usar `async/await` para toda operación asíncrona. Nunca usar `.then()` plano.

### 5.2 Patrón de Página (Archivo en `js/paginas/`)

```javascript
import { supabase } from '../supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  await verificarSesion();
  inicializarPagina();
});

async function inicializarPagina() {
  const datos = await cargarDatos();
  renderizar(datos);
  configurarEventos();
}

async function cargarDatos() { /* ... */ }
function renderizar(datos) { /* ... */ }
function configurarEventos() { /* ... */ }
```

### 5.3 Llamadas a Supabase

Toda llamada a Supabase debe usar `consultarSeguro`:

```javascript
import { supabase } from '../supabase.js';

async function consultarSeguro(promesa) {
  try {
    const { data, error } = await promesa;
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('[DB Error]', e.message);
    mostrarErrorUsuario(e.message);
    return null;
  }
}

function mostrarErrorUsuario(mensaje) {
  // Implementar toast o notificación en UI
}

// Uso correcto:
const ventas = await consultarSeguro(
  supabase.from('pos_ventas').select('*').order('created_at', { ascending: false })
);
```

### 5.4 Manejo de Errores

- Toda función async debe tener `try/catch`
- Los errores de Supabase se capturan con `consultarSeguro`
- Los errores de validación se muestran al usuario con `mostrarErrorUsuario`
- No silenciar errores con `catch(e) {}` vacío

### 5.5 Strings Mágicos

Los estados, tipos y valores fijos se definen como constantes al inicio del archivo:

```javascript
const ESTADOS_VENTA = ['PENDIENTE', 'CONFIRMADA', 'FACTURADA', 'ANULADA'];
const ESTADOS_CAJA = ['ABIERTA', 'CERRADA'];
const TIPOS_MOVIMIENTO = [
  'entrada_compra', 'salida_venta', 'ajuste_incremento', 'ajuste_decremento',
  'devolucion_compra', 'devolucion_venta', 'transferencia_salida',
  'transferencia_entrada', 'merma'
];
```

### 5.6 Estado Compartido entre Páginas

Como la navegación es multi-página, el estado se comparte vía:

- **`localStorage`** para datos de sesión (caja activa, usuario logueado)
- **Query params** en URL para datos específicos (`?cliente_id=xxx`, `?venta_id=xxx`)
- Nunca usar variables globales (`window.miVariable`)

```javascript
// Guardar
localStorage.setItem('caja_activa', JSON.stringify({ id, monto_inicial, estado }));

// Leer
const caja = JSON.parse(localStorage.getItem('caja_activa'));

// Leer query params
function obtenerParametroURL(nombre) {
  return new URLSearchParams(window.location.search).get(nombre);
}
```

---

## 6. Patrón de Componentes Compartidos

Todo componente reutilizable sigue esta estructura:

### 6.1 Modal

```javascript
// js/compartido/modal.js
function Modal({ titulo, contenido, onCerrar }) {
  const $div = document.createElement('div');
  $div.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50';
  $div.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-slate-950">${titulo}</h2>
        <button class="text-slate-400 hover:text-slate-600 text-xl" id="btn-cerrar-modal">&times;</button>
      </div>
      ${contenido}
    </div>
  `;
  $div.querySelector('#btn-cerrar-modal').onclick = () => { $div.remove(); if (onCerrar) onCerrar(); };
  $div.addEventListener('click', (e) => { if (e.target === $div) { $div.remove(); } });
  document.body.appendChild($div);
  return $div;
}
```

### 6.2 Navbar

```javascript
// js/compartido/navbar.js
document.addEventListener('DOMContentLoaded', () => {
  const $navbar = document.getElementById('navbar');
  if (!$navbar) return;

  const paginaActual = window.location.pathname.split('/').pop();

  const enlaces = [
    { href: 'index.html', label: 'Dashboard', icono: '📊' },
    { href: 'ventas.html', label: 'Ventas', icono: '🛒' },
    { href: 'productos.html', label: 'Productos', icono: '📦' },
    { href: 'clientes.html', label: 'Clientes', icono: '👤' },
  ];

  $navbar.innerHTML = `
    <nav class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div class="flex items-center gap-1">
          ${enlaces.map(e => `
            <a href="${e.href}" class="px-3 py-2 rounded-lg text-sm transition-all duration-200
              ${paginaActual === e.href ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}">
              ${e.label}
            </a>
          `).join('')}
        </div>
        <button id="btn-cerrar-sesion" class="text-sm text-slate-500 hover:text-slate-700">Cerrar sesión</button>
      </div>
    </nav>
  `;

  document.getElementById('btn-cerrar-sesion')?.addEventListener('click', cerrarSesion);
});
```

### 6.3 Tabla Dinámica

```javascript
// js/compartido/tabla.js
function Tabla({ columnas, datos, onFilaClick }) {
  const $table = document.createElement('table');
  $table.className = 'w-full text-left';
  $table.innerHTML = `
    <thead>
      <tr class="border-b border-slate-200">
        ${columnas.map(c => `<th class="py-3 px-4 text-sm font-medium text-slate-500">${c.titulo}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${datos.map(fila => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
          ${columnas.map(c => `<td class="py-3 px-4 text-sm text-slate-950">${fila[c.campo] ?? '-'}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  `;
  // Si no hay datos, mostrar mensaje
  if (!datos?.length) {
    $table.querySelector('tbody').innerHTML =
      '<tr><td colspan="100" class="py-8 text-center text-slate-400">Sin datos</td></tr>';
  }
  return $table;
}
```

---

## 7. Conexión a Supabase

### 7.1 Archivo de Configuración (`config.js`)

Las credenciales de Supabase **nunca van harcodeadas** en el código. Se manejan con dos archivos:

| Archivo | Se sube a GitHub | Contenido |
|---|---|---|
| `config.ejemplo.js` | ✅ Sí | Template con placeholders (`TU_PROYECTO_DEV`, `tu-anon-key-de-desarrollo`) |
| `config.js` | ❌ No (`.gitignore`) | Credenciales reales |

Para usar: copiar `config.ejemplo.js` a `config.js`, reemplazar los valores y cambiar `ENTORNO` según el ambiente:

```javascript
const ENTORNO = 'development'; // 'development' | 'production'
const CONFIG = {
  development: {
    supabaseUrl: 'https://TU_PROYECTO_DEV.supabase.co',
    supabaseAnonKey: 'tu-anon-key-de-desarrollo',
  },
  production: {
    supabaseUrl: 'https://TU_PROYECTO_PROD.supabase.co',
    supabaseAnonKey: 'tu-anon-key-de-produccion',
  }
};
```

### 7.2 Archivo `supabase.js`

```javascript
// js/supabase.js — Único lugar donde se crea el cliente
if (typeof CONFIG === 'undefined') {
  console.error('[supabase.js] ERROR: config.js no encontrado');
}

const SUPABASE_URL = CONFIG?.supabaseUrl || 'https://FALTA_CONFIG.supabase.co';
const SUPABASE_ANON_KEY = CONFIG?.supabaseAnonKey || 'falta-config';

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = window.supabaseClient;
```

Reglas:
- Este archivo es el **único** que crea el cliente Supabase
- Todas las páginas importan `supabase` desde aquí
- `config.js` se carga en el HTML **antes** que `supabase.js`:
  ```html
  <script src="js/config.js"></script>
  <script src="js/supabase.js"></script>
  ```
- No exponer `service_role` key en el frontend

---

## 8. Reglas de Tailwind CSS

### 8.1 Paleta Oficial (Slate)
- Fondo app: `bg-slate-50`
- Tarjetas: `bg-white`
- Texto principal: `text-slate-950`
- Texto secundario: `text-slate-500`
- Botón principal: `bg-slate-950 text-white hover:bg-slate-800`
- Bordes: `border-slate-200`
- Inputs: `border-slate-300 focus:ring-2 focus:ring-slate-950 focus:border-slate-950`

### 8.2 Responsive (Mobile-First)
- Móvil: diseño base (sin prefijo) — mínimo 360px
- Tablet: `sm:` a partir de 640px
- Escritorio: `md:` a partir de 768px
- Escritorio grande: `lg:` a partir de 1024px

### 8.3 Buenas Prácticas
- Preferir clases de utilidad de Tailwind sobre CSS personalizado
- No escribir `px-4` y luego sobrescribir con CSS. Usar variantes responsive: `px-4 sm:px-6 lg:px-8`
- Para hover/focus, usar `transition-all duration-200`
- No crear componentes CSS personalizados. Usar composición de clases Tailwind
- Las únicas excepciones para CSS personalizado son animaciones complejas o estilos que Tailwind no soporta

---

## 9. Navegación entre Páginas

- Toda navegación usa `<a href="pagina.html">` tradicional
- Parámetros entre páginas vía query string: `<a href="ventas.html?id=xxx">`
- No usar `history.pushState` ni `popstate`
- La página activa en el navbar se marca comparando `window.location.pathname`
- Para proteger páginas que requieren sesión:

```javascript
// auth.js
async function verificarSesion() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}
```

---

## 10. Manejo de Formularios

```javascript
function obtenerDatosFormulario($form) {
  const datos = {};
  const inputs = $form.querySelectorAll('input, select, textarea');
  inputs.forEach($input => {
    const nombre = $input.name || $input.id;
    if (nombre) datos[nombre] = $input.value.trim();
  });
  return datos;
}

function limpiarFormulario($form) {
  $form.querySelectorAll('input, select, textarea').forEach($el => {
    if ($el.tagName === 'SELECT') $el.selectedIndex = 0;
    else if ($el.type === 'checkbox') $el.checked = false;
    else $el.value = '';
  });
}
```

---

## 11. Comentarios

- Solo en español
- Solo cuando explican **el por qué**, no el qué
- El código debe ser auto-documentado (nombres de variables/funciones descriptivos)

```javascript
// ✅ Correcto: explica por qué se hace
// Se recalcula el total porque el precio unitario cambió al seleccionar otra variante
total = calcularTotal(items);

// ❌ Incorrecto: explica qué hace (ya es obvio)
// Calcula el total de la venta
total = calcularTotal(items);
```

---

## 12. Dependencias Externas

- No importar librerías externas sin autorización explícita
- Las únicas dependencias permitidas son:
  - Tailwind CSS (CDN)
  - Supabase JS (CDN)
- No usar jQuery, Lodash, Axios, Moment.js ni similares
- Si se necesita funcionalidad adicional, implementarla en vanilla JS dentro de `js/compartido/`

---

## 13. Formateo de Moneda y Fechas (Utils)

```javascript
// js/compartido/utils.js
function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor ?? 0);
}

function formatearFecha(isoString) {
  return new Date(isoString).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatearFechaHora(isoString) {
  return new Date(isoString).toLocaleString('es-CO');
}

function generarNumeroVenta(prefijo) {
  const ahora = new Date();
  const anioMes = `${ahora.getFullYear()}${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  const correlativo = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `${prefijo}-${anioMes}-${correlativo}`;
}
```

---

## 14. Resumen de Reglas para la IA

1. **No inventar tecnologías.** Si algo no está en este codex o en las specs, preguntar
2. **Seguir la estructura de archivos exacta** de la sección 2
3. **Usar la plantilla HTML** de la sección 3 para cada nueva página
4. **Respetar naming** de la sección 4
5. **Toda función ≤ 30 líneas**
6. **Toda llamada a Supabase usa `consultarSeguro`**
7. **Los estados se definen como constantes**, no como strings mágicos
8. **El estado entre páginas va en `localStorage` o query params**
9. **Tailwind para todo el diseño.** CSS propio solo como excepción
10. **Comentarios en español y solo para explicar el "por qué"**
