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