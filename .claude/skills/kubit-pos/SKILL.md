---
name: kubit-pos
description: Reglas de negocio del módulo POS del ecosistema Kubit. Usar cuando se trabaje en ventas, caja, inventario, compras, facturación electrónica DIAN o finanzas mensuales.
metadata:
  module: POS
  project: Kubit
  spec: 03-pos-spec.md
---

# Módulo POS - Kubit

Este skill contiene las reglas de negocio del módulo POS (Point of Sale) del ecosistema Kubit. Gestiona ventas presenciales, control de caja, inventario, compras, facturación electrónica (DIAN) y finanzas mensuales para PYMES colombianas.

## Tablas del Módulo

Todas las tablas del módulo POS usan el prefijo `pos_*`. 24 tablas en total.

## Reglas de Negocio

### Ventas
- **Número de venta:** Formato `{prefijo_facturacion}-{año}{mes}-{correlativo}` (ej. `KBT-202605-0001`)
- **Descuento:** No puede exceder `descuento_max` definido en `pos_productos_detalle`
- **Stock:** Al confirmar una venta, se valida `stock_actual >= cantidad`. Si no hay stock suficiente, la venta no puede confirmarse
- **Múltiples métodos de pago:** Una venta puede dividirse entre varios métodos de pago (ej. 50% Efectivo + 50% Tarjeta). Se registra el método principal en `metodo_pago`
- **Cliente opcional:** Una venta puede registrarse sin cliente (venta al público general)
- **Estados de venta:** PENDIENTE → CONFIRMADA → FACTURADA | ANULADA

### Caja
- Cada sesión de caja tiene: apertura, ingresos, egresos, ventas, y cierre
- Al abrir caja se registra el `monto_inicial`
- Al cerrar, se valida el `monto_final_esperado` vs `monto_final_real`
- Diferencia se registra como sobrante o faltante

### Inventario
- Cada producto tiene `stock_actual` y `stock_minimo`
- Al caer por debajo del mínimo se genera alerta de reorden
- El inventario se descuenta al CONFIRMAR (no al crear) una venta
- Las compras ingresan inventario al confirmar recepción

### Facturación Electrónica (DIAN)
- Integración con resolución de facturación de la DIAN
- La factura se emite contra la DIAN al pasar venta a estado FACTURADA
- Se requiere configuración de resolución vigente en `pos_configuracion_empresa`

### Finanzas Mensuales
- Cálculo automático de ingresos, costos, gastos y utilidad por mes
- Basado en ventas CONFIRMADAS y FACTURADAS del período

## Convenciones

- El prefijo de facturación por defecto es `KBT`
- El formato de serie es el mismo prefijo
- Todos los IDs son UUID v4
- Soft delete con `deleted_at` nullable
