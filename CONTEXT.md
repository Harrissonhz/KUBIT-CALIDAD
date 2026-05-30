# CONTEXT.md — Glosario de Dominio Kubit

Este archivo define el lenguaje del dominio del ecosistema Kubit. Sirve como referencia para que cualquier IA use la terminología correcta al desarrollar, documentar o conversar sobre el proyecto.

---

## 1. El Ecosistema

| Término | Definición |
|---|---|
| **Kubit** | Nombre del ecosistema SaaS. "La unidad básica de tu negocio digital." |
| **Spec-Driven Development (SDD)** | Metodología de desarrollo donde los archivos de especificación en `/specs/` son la fuente de verdad. Todo código debe ser validado contra las specs. |
| **Módulo** | Cada una de las capacidades del ecosistema que se pueden vender por separado: POS, Store, Academy (futuro). |

---

## 2. Módulo POS (Point of Sale)

| Término | Definición |
|---|---|
| **POS** | Módulo de Punto de Venta. Núcleo transaccional del sistema. Gestiona ventas presenciales, control de caja, inventario, compras y facturación electrónica. |
| **Venta** | Transacción comercial registrada en el sistema. Una venta puede tener múltiples métodos de pago. Estados: PENDIENTE → CONFIRMADA → FACTURADA / ANULADA. |
| **Número de venta** | Identificador único de venta con formato `{prefijo}-{año}{mes}-{correlativo}`. Ej: `KBT-202605-0001`. |
| **Prefijo de facturación** | Código de 3 letras para numeración de facturas. Por defecto: `KBT`. |
| **Serie** | Serie del comprobante fiscal. Mismo valor que el prefijo de facturación. |
| **Caja** | Sesión de caja registradora. Cada apertura y cierre se registra con montos. |
| **Apertura de caja** | Inicio de sesión de caja con `monto_inicial`. |
| **Cierre de caja** | Fin de sesión con validación de `monto_esperado` vs `monto_real`. |
| **Arqueo** | Verificación de diferencias entre monto esperado y real al cerrar caja. |
| **Compra** | Adquisición de producto a proveedor. Incrementa el inventario al confirmar recepción. |
| **Facturación electrónica** | Emisión de factura contra la DIAN (autoridad fiscal colombiana). |
| **DIAN** | Dirección de Impuestos y Aduanas Nacionales de Colombia. |
| **Stock actual** | Cantidad disponible de un producto en inventario. |
| **Stock mínimo** | Umbral que al ser alcanzado genera alerta de reorden. |
| **Producto** | Bien o servicio vendible. Puede tener variantes (talla, color, etc.). |
| **Producto detalle** | Variante específica de un producto con precio, stock y SKU propios. |
| **Categoría** | Clasificación jerárquica de productos. |
| **Cliente** | Persona o empresa que realiza compras. Su registro es opcional en POS. |
| **PYME** | Pequeña y Mediana Empresa. Segmento objetivo del ecosistema Kubit. |
| **RBAC** | Role-Based Access Control. Control de acceso basado en roles. |

---

## 3. Módulo Store (Tienda Virtual)

| Término | Definición |
|---|---|
| **Store** | Módulo de Tienda Virtual. Componente de comercio electrónico para venta en línea. |
| **Catálogo** | Conjunto de productos publicados visible al público. Se sincroniza desde POS. |
| **Carrito de compras** | Lista temporal de productos que un cliente desea comprar. |
| **Checkout** | Proceso de finalización de compra que incluye dirección, envío y pago. |
| **Pedido** | Orden de compra confirmada. Estados: PENDIENTE → CONFIRMADO → ENVIADO → ENTREGADO / CANCELADO. |
| **Número de pedido** | Identificador único de pedido. Mismo formato que número de venta: `KBT-202605-0001`. |
| **Guest checkout** | Compra sin registro de cuenta. |
| **Cupón** | Código de descuento aplicable a pedidos. |
| **Wishlist** | Lista de deseos del cliente. |
| **Reseña** | Opinión y calificación de un producto por un cliente. |
| **Envío** | Proceso de entrega de un pedido con seguimiento y tracking. |
| **Dirección de envío** | Ubicación donde se entrega el pedido. |
| **Dirección de facturación** | Ubicación fiscal asociada al comprobante de pago. |

---

## 4. Módulo Academy (Futuro)

| Término | Definición |
|---|---|
| **Academy** | Módulo de aprendizaje en línea. Post-MVP. Tablas con prefijo `academy_*`. |

---

## 5. Infraestructura y Tecnología

| Término | Definición |
|---|---|
| **Supabase** | Plataforma backend: PostgreSQL, Auth, Storage, Edge Functions, Realtime. Plan gratuito. |
| **Vercel** | Plataforma de hosting para el frontend. Plan gratuito. |
| **Supabase-js** | Cliente JavaScript oficial de Supabase. Única dependencia externa permitida. |
| **PostgREST** | API REST automática generada desde el esquema PostgreSQL de Supabase. |
| **RLS** | Row-Level Security. Políticas de seguridad a nivel de fila en PostgreSQL. |
| **Tailwind CSS** | Framework de CSS utilitario. Vía CDN, sin npm. |
| **PWA** | Progressive Web App. Permite instalación en dispositivos. |

---

## 6. Base de Datos

| Término | Definición |
|---|---|
| **`pos_*`** | Prefijo de tablas del módulo POS (24 tablas). |
| **`st_*`** | Prefijo de tablas del módulo Store (10 tablas). |
| **`academy_*`** | Prefijo de tablas del módulo Academy (futuro). |
| **UUID v4** | Formato de identificador único universal. Usado como PK en todas las tablas. |
| **Soft delete** | Borrado lógico mediante campo `deleted_at` nullable. |
| **`timestamptz`** | Tipo de dato para timestamps con zona horaria en PostgreSQL. |
| **CHECK constraint** | Restricción en PostgreSQL para validar valores de estado. Alternativa a ENUMs. |

---

## 7. Diseño UI/UX

| Término | Definición |
|---|---|
| **Slate** | Paleta de colores monocromática de Tailwind usada en todo el sistema. |
| **Mobile-first** | Enfoque de diseño que prioriza pantallas desde 360px de ancho. |
| **Estilo Apple** | Referencia de diseño ultra-minimalista y corporativo. |
| **Standalone** | Modo PWA que oculta la barra de navegación del navegador. |

---

## 8. Licenciamiento

| Término | Definición |
|---|---|
| **Bundle** | Paquete que incluye múltiples módulos. Cliente puede comprar POS solo, Store solo o ambos. |
| **Módulo independiente** | Cada módulo se puede vender por separado. No requiere migración al agregar otro. |

---

## 9. Convenciones de Código

| Término | Definición |
|---|---|
| **camelCase** | Convención para funciones y variables en JavaScript. |
| **kebab-case** | Convención para IDs, clases HTML y nombres de archivo. |
| **PascalCase** | Convención para clases en JavaScript. |
| **SDD Riguroso** | La especificación prevalece sobre el código. No asumir lo que no está en `/specs/`. |
