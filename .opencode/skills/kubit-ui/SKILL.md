---
name: kubit-ui
description: Sistema de diseño UI/UX del ecosistema Kubit. Usar al crear o modificar cualquier interfaz visual para garantizar consistencia con la paleta Slate, responsive mobile-first, modo oscuro y capacidades PWA.
metadata:
  project: Kubit
  spec: 05-ui-ux-system.md
---

# Sistema de Diseño UI/UX - Kubit

Este skill rige la interfaz visual y el comportamiento en dispositivos de todo el ecosistema Kubit.

## Filosofía Visual
- Ultra-minimalista, limpio y corporativo (Estilo Apple)
- Monocromático de alto contraste (Negro Puro)
- Preparado nativamente para inversión de color (Dark Mode)

## Paleta de Colores Oficial (Tailwind CSS)

### Modo Claro (Por Defecto)
- Fondo de la App: `bg-slate-50` (#F8FAFC)
- Contenedores/Tarjetas: `bg-white` (#FFFFFF)
- Texto Principal: `text-slate-950` (#020617)
- Texto Secundario/Labels: `text-slate-500` (#64748B)
- Botón Principal: `bg-slate-950 text-white hover:bg-slate-800`
- Bordes y Separadores: `border-slate-200/60`

### Modo Oscuro (Soporte Nativo Futuro)
- Fondo de la App: `dark:bg-slate-950`
- Contenedores/Tarjetas: `dark:bg-slate-900`
- Texto Principal: `dark:text-white`
- Texto Secundario: `dark:text-slate-400`
- Botón Principal: `dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100`
- Bordes y Separadores: `dark:border-slate-800`

## Adaptabilidad (Responsivo Mobile-First)
- Toda interfaz debe ser completamente funcional en pantallas táctiles desde 360px de ancho
- El POS debe priorizar tablets (horizontal) y celulares
- Usar exclusivamente clases de quiebre de Tailwind (`sm:`, `md:`, `lg:`)
- No duplicar código para distintas vistas

## Capacidades PWA
- Archivo `manifest.json` obligatorio
- `service-worker.js` para instalación en dispositivos
- Icono: Logotipo minimalista de Kubit con fondo blanco/negro
- Modo de visualización: `standalone`
- La app debe funcionar como PWA instalable en iOS, Android y Escritorio

## Convenciones de Clases
- Preferir clases de utilidad Tailwind sobre CSS personalizado
- No crear archivos CSS personalizados excepto para estilos que Tailwind no pueda cubrir
- Mantener consistencia con la paleta Slate en todo momento
