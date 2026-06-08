# Especificación Maestra - Ecosistema Kubit

## 1. Visión General
Este documento constituye la **Fuente Única de Verdad (Single Source of Truth)** para el ecosistema SaaS "Kubit". Cualquier decisión de diseño, estructura de datos o flujo de trabajo debe ser validada contra este documento y sus archivos hijos dentro de `/specs`.

## 2. Arquitectura del Proyecto
El proyecto sigue una estructura de directorios estricta para separar la definición (specs) de la implementación (apps).
- `/specs`: Contiene los archivos de especificación (Plano Maestro, BD, UI/UX).
- `/apps`: Contiene la lógica ejecutable del software (POS, Store, etc.).

*Nota: Referenciar siempre `ARCHITECTURE.md` para detalles de la infraestructura de servicios.*

## 3. Identidad Visual (UI/UX)
El estilo es **Ultra-minimalista y corporativo (Estilo Apple)**.
- **Base:** Tailwind CSS.
- **Paleta:** Colores Monocromáticos (Slate).
- **Consistencia:** Todo componente debe seguir estrictamente las definiciones de `05-ui-ux-system.md`. No se permiten improvisaciones visuales.

## 4. Estructura de Datos
La base de datos se rige por un esquema relacional unificado.
- **Motor:** PostgreSQL (vía Supabase).
- **Tablas principales:** `ventas`, `productos`, `usuarios`, `caja_apertura`, `clientes`, etc.
- **Referencia técnica:** Consultar siempre `02-database-schema.sql` (o `Supabase.md`) antes de realizar cualquier operación CRUD.

## 5. Reglas de Desarrollo (SDD Riguroso)
Para mantener la integridad del proyecto, se establecen las siguientes reglas:
1. **No asumir:** Si falta una especificación en los archivos de `/specs`, la IA **debe** pausar y consultar al usuario. Nunca se debe inventar lógica o estructura de datos.
2. **Jerarquía:** La especificación siempre prevalece sobre el código. Si el código actual diverge de la especificación, se debe actualizar la especificación primero (previa aprobación) o corregir el código.
3. **Modularidad:** Todo desarrollo debe ser autónomo dentro de su carpeta en `/apps`.

## 6. Mapa de Artefactos
- `/specs/01-master-spec.md` (Este documento)
- `/specs/02-database-schema.sql`
- `/specs/03-pos-spec.md`
- `/specs/04-store-spec.md`
- `/specs/05-ui-ux-system.md`
- `/specs/06-servicio-correo.md`
- `/specs/10-codex.md`
- `/specs/11-api-contracts.md` (Pendiente)
- `/specs/12-roadmap.md`
- `/specs/06-academy-spec.md` (Pendiente)
- `/specs/ARCHITECTURE.md`
- `/AGENTS.md`

### 6.1 Apps
- `/apps/pos/` (Pendiente)
- `/apps/store/` (Pendiente)
- `/apps/academy/` (Futuro)
