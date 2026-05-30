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

### B. Modo Oscuro (Soporte Nativo Futuro)
- Fondo de la App: `dark:bg-slate-950`
- Contenedores/Tarjetas: `dark:bg-slate-900`
- Texto Principal: `dark:text-white`
- Texto Secundario: `dark:text-slate-400`
- Botón Principal: `dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100`
- Bordes y Separadores: `dark:border-slate-800`

## 3. Adaptabilidad (Responsivo Mobile-First)
- Toda interfaz debe ser completamente funcional en pantallas táctiles desde 360px de ancho (celulares estándar) hasta pantallas de escritorio.
- El POS debe priorizar una visualización cómoda en Tablets (orientación horizontal) y Celulares para facilitar el cobro en mostrador o en movimiento.
- Se utilizarán exclusivamente las clases de quiebre de Tailwind (`sm:`, `md:`, `lg:`) para reordenar los elementos en móviles sin duplicar código.

## 4. Capacidades PWA (Progressive Web App)
- El sistema incluirá un archivo `manifest.json` y un `service-worker.js` para permitir la instalación directa en dispositivos iOS, Android y Escritorio.
- Icono de la App: Logotipo minimalista de Kubit con fondo blanco/negro según corresponda.
- Modo de visualización: `standalone` (oculta la barra de navegación del navegador web para simular una app nativa).