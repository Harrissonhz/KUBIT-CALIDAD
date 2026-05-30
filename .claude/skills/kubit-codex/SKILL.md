---
name: kubit-codex
description: Convenciones de código del proyecto Kubit. Usar al generar o modificar cualquier archivo de código en /apps/ para garantizar consistencia, mantenibilidad y predecibilidad.
metadata:
  project: Kubit
  spec: 10-codex.md
---

# Codex - Convenciones de Código Kubit

Este skill define las convenciones de código que toda IA debe seguir al generar archivos en `/apps/` del proyecto Kubit.

## Convenciones Generales

### JavaScript
- **camelCase** para funciones y variables: `calcularTotal`, `obtenerCliente`
- **PascalCase** para clases y constructores
- Nombres descriptivos en español

### HTML
- **kebab-case** para IDs y clases: `btn-cobrar`, `modal-cliente`, `form-producto`
- HTML semántico (header, main, section, article, nav)
- Atributos `lang="es"` en la etiqueta html

### Archivos
- **kebab-case** para nombres de archivo: `perfil-cliente.js`, `lista-productos.html`
- Un archivo por componente/funcionalidad
- Archivos JS en `apps/<modulo>/js/`
- Archivos CSS en `apps/<modulo>/css/`

### Dependencias
- Preferir vanilla JavaScript
- Evitar dependencias externas
- Tailwind CSS vía CDN (no npm)
- Solo `supabase-js` como dependencia externa permitida

### Supabase
- Usar `supabase-js` directamente (sin ORMs)
- Cliente importado desde `js/supabase.js`
- RLS habilitado en todas las tablas
- Políticas por rol (anon, authenticated, service_role)

### Diseño UI
- Ultra-minimalista, monocromático Slate
- Responsive mobile-first (mínimo 360px)
- Clases Tailwind: `bg-slate-50`, `text-slate-950`, `border-slate-200/60`
- Botón principal: `bg-slate-950 text-white hover:bg-slate-800`
- Dark mode preparado con clases `dark:`

### Comentarios
- En español
- Solo explicar el "por qué", no el "qué"
- El código debe ser auto-documentado

### Navegación
- Sin frameworks SPA
- HTML vanilla con navegación tradicional
- Alpine.js ligero permitido si es necesario
