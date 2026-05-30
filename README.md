# Kubit: Ecosistema SaaS Modular

## 1. Definición del Proyecto
Kubit es un ecosistema SaaS diseñado bajo una arquitectura modular de alta interoperabilidad. Su objetivo no es crear una aplicación monolítica, sino un conjunto de soluciones interconectadas (POS, Tienda Virtual, Gestión Financiera) que comparten una misma base de datos y un sistema de diseño unificado.

## 2. ¿Qué es Kubit en este contexto?
Kubit - La unidad básica de tu negocio digital.
Kubit se define como un **Sistema de Operación de Negocios Interconectado**. A diferencia de los SaaS tradicionales, Kubit permite que los datos fluyan entre módulos sin fricción:
- **Interconexión:** Un producto creado en el sistema central impacta simultáneamente el inventario del POS y el catálogo de la Tienda Virtual.
- **Escalabilidad:** Cada módulo reside en su propio espacio lógico (`/apps`), pero se rige por las mismas reglas de negocio centralizadas en `/specs`.

## 3. Metodología SDD (Spec-Driven Development)
Este proyecto se desarrolla estrictamente bajo la metodología **SDD**. Esto significa que:
1. **La Especificación es la Verdad:** Cualquier cambio en el código (`/apps`) debe haber sido documentado y aprobado previamente en los archivos de especificación (`/specs`).
2. **Cero Asunciones:** Como IA o desarrollador, si un requerimiento no está claro o no está documentado en `/specs`, **no se debe asumir** ninguna lógica. Se debe consultar al responsable del proyecto para resolver el vacío antes de proceder.
3. **Prioridad del Plano:** El `01-master-spec.md` y los documentos hijos (`02-database-schema.sql`, `05-ui-ux-system.md`, etc.) son los archivos maestros que dictan el comportamiento del sistema.

## 4. Estructura del Repositorio
```text
/
├── /specs                        <-- Fuente de verdad (Documentación y Planos)
│   ├── 01-master-spec.md         <-- Constitución del proyecto
│   ├── 02-database-schema.sql    <-- Esquema relacional centralizado
│   ├── 03-pos-spec.md            <-- Especificaciones del módulo POS
│   ├── 04-store-spec.md          <-- Especificaciones del módulo Tienda
│   └── 05-ui-ux-system.md        <-- Sistema de Diseño y UI
├── /apps                         <-- Código fuente ejecutable
│   ├── /pos                      <-- Lógica del Punto de Venta
│   └── /store                    <-- Lógica de la Tienda Virtual
└── README.md                     <-- Este archivo