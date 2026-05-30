---
name: kubit-store
description: Reglas de negocio del módulo Tienda Virtual del ecosistema Kubit. Usar cuando se trabaje en catálogo público, carrito de compras, checkout, procesamiento de pagos o gestión de pedidos.
metadata:
  module: Store
  project: Kubit
  spec: 04-store-spec.md
---

# Módulo Tienda Virtual - Kubit

Este skill contiene las reglas de negocio del módulo Store (Tienda Virtual) del ecosistema Kubit. Componente de comercio electrónico que permite la venta de productos a través de un catálogo público en línea.

## Tablas del Módulo

Todas las tablas del módulo Store usan el prefijo `st_*`. 10 tablas en total.

## Reglas de Negocio

### Catálogo
- Los productos visibles en tienda se sincronizan desde `pos_productos`
- Un producto es visible si tiene `publicado_en_store = true` y stock disponible
- Las imágenes se almacenan como URLs externas (no en Supabase Storage)

### Carrito de Compras
- El carrito es anónimo hasta el checkout
- Al iniciar checkout se requiere registro o login del cliente
- El carrito tiene expiración (TTL configurable)

### Checkout
- Dirección de envío y facturación pueden ser diferentes
- Se calcula costo de envío basado en ubicación
- Se validan medios de pago disponibles en `pos_metodos_pago`
- Al confirmar el pedido se descuenta inventario temporalmente

### Pedidos
- **Número de pedido:** Formato `{prefijo}-{año}{mes}-{correlativo}` (ej. `KBT-202605-0001`)
- Estados: PENDIENTE → CONFIRMADO → ENVIADO → ENTREGADO | CANCELADO
- Un pedido puede tener múltiples items y métodos de pago
- El cliente puede ver el historial de sus pedidos

### Integración con POS
- Los pedidos de tienda aparecen como ventas PENDIENTES en POS
- Al confirmar pago en tienda, se genera una venta CONFIRMADA en POS
- El inventario es compartido entre POS y Store

## Convenciones

- Mismo prefijo `KBT` que el módulo POS
- Todos los IDs son UUID v4
- Soft delete con `deleted_at` nullable
- Timestamps con `timestamptz` y `default now()`
