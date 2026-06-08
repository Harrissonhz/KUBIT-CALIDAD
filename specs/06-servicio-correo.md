# Especificacion: Servicio de Correo Transaccional

> **POST-MVP** — No implementar en la version inicial (v1).
> Mantener este documento como referencia para la proxima version.
> Decision: con ~1 venta/mes, el costo de implementacion y
> mantenimiento supera el beneficio. Se reemplaza por modal de
> exito en checkout + gestion manual del store owner.

---

## 1. Contexto y Entornos

### 1.1 Proposito
Enviar un correo de confirmacion al cliente cuando realiza un pedido en la Tienda Virtual. Sin notificaciones de cambio de estado, sin Database Webhooks, sin tracking de eventos.

### 1.2 Proveedor: Resend
- **Plan gratuito:** 100 emails/dia, 3.000 emails/mes, 1 dominio, API Key unica
- **Sitio:** https://resend.com
- **API Base:** `https://api.resend.com`
- **Documentacion:** https://resend.com/docs

### 1.3 Entornos

| Aspecto | Calidad (QA) | Produccion |
|---|---|---|
| URL frontal | `https://outletshop-calidad.vercel.app` | `https://outletshop.club` |
| Dominio Resend | `onboarding@resend.dev` (gratuito, pre-verificado) | Dominio personalizado verificado (ej. `outletshop.club`) |
| Remitente | `OutletShop Calidad <onboarding@resend.dev>` | `OutletShop <no-reply@outletshop.club>` |
| Destinatarios | Solo email del admin/desarrollador | Email real del cliente |
| API Key | `RESEND_API_KEY` de cuenta QA | `RESEND_API_KEY` de cuenta Produccion |

**Regla de calidad:** En el entorno QA, el Edge Function debe REEMPLAZAR el destinatario real por el email del admin configurado en `ADMIN_EMAIL` para evitar enviar correos de prueba a clientes reales.

---

## 2. Arquitectura

### 2.1 Diagrama de flujo

```
┌────────────────────────────────────────────────────────────────┐
│                    STORE (Cliente)                              │
│  checkout.js                                                    │
│    ┌─ 1. Crea pedido (7 ops REST)                               │
│    └─ 2. POST /functions/v1/send-mail  ──────┐                  │
└───────────────────────────────────────────────┘                  │
                                              ▼                    │
                                ┌──────────────────────────┐      │
                                │  Supabase Edge Function   │      │
                                │  send-mail/index.ts       │      │
                                │                           │      │
                                │  1. Recibe { pedidoId }   │      │
                                │  2. Consulta DB:          │      │
                                │     pedido + cliente      │      │
                                │  3. Renderiza template    │      │
                                │     confirmacion HTML     │      │
                                │  4. POST a Resend API     │      │
                                │  5. Retorna {exito,error} │      │
                                └──────────┬───────────────┘      │
                                           │                      │
                                           ▼                      │
                                ┌──────────────────────────┐      │
                                │     Resend API            │      │
                                │  POST /emails             │      │
                                └──────────────────────────┘      │
```

### 2.2 Decisiones de Arquitectura

| Decision | Justificacion |
|---|---|
| **Edge Function** como intermediario | La API Key de Resend JAMAS debe exponerse al cliente. El EF actua como proxy seguro. |
| **Un unico template** (confirmacion) | Sin cambios de estado ni webhooks. Solo se envia correo al crear el pedido. |
| **Sin tabla de tracking** | Se asume que Resend maneja la entrega. Si se necesita auditoria, se agrega en version futura. |
| **Templates inline en TypeScript** | Evita dependencias externas y simplifica el despliegue. Un solo archivo `index.ts` sin `templates.ts` separado. |

---

## 3. Variables de Entorno

### 3.1 Definicion

| Variable | Descripcion | Ejemplo Calidad | Ejemplo Produccion |
|---|---|---|---|
| `RESEND_API_KEY` | API Key de Resend | `re_abc123...` | `re_xyz789...` |
| `RESEND_FROM_EMAIL` | Remitente fijo | `onboarding@resend.dev` | `no-reply@outletshop.club` |
| `APP_URL` | URL base del frontend | `https://outletshop-calidad.vercel.app` | `https://outletshop.club` |
| `ADMIN_EMAIL` | Email del admin (QA only) | `admin@ejemplo.com` | (no usado en prod) |

### 3.2 Configuracion en cada entorno

**Local (desarrollo):**
```bash
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set RESEND_FROM_EMAIL=onboarding@resend.dev
supabase secrets set APP_URL=http://localhost:3000
supabase secrets set ADMIN_EMAIL=admin@ejemplo.com
```

**Calidad (Vercel + Supabase):**
```bash
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set RESEND_FROM_EMAIL=onboarding@resend.dev
supabase secrets set APP_URL=https://outletshop-calidad.vercel.app
supabase secrets set ADMIN_EMAIL=admin@ejemplo.com
```

**Produccion (Vercel + Supabase):**
```bash
supabase secrets set RESEND_API_KEY=re_xxx_prod
supabase secrets set RESEND_FROM_EMAIL=no-reply@outletshop.club
supabase secrets set APP_URL=https://outletshop.club
# ADMIN_EMAIL NO se configura en produccion
```

### 3.3 Referencia en `supabase/config.toml`

```toml
[functions.send-mail]
verify_jwt = false
```

Los secrets NO se almacenan en `config.toml`. Se configuran via `supabase secrets set` y se referencian en el codigo via `Deno.env.get()`.

---

## 4. Edge Function: send-mail

### 4.1 Ubicacion y estructura

```
supabase/functions/send-mail/
└── index.ts          ← Entry point (handler + template inline)
```

### 4.2 Contrato de entrada

**Endpoint:** `POST /functions/v1/send-mail`

**Headers:**
- `Content-Type: application/json`

**Payload:**
```json
{
  "pedidoId": "uuid-de-st-pedidos"
}
```

**Respuesta exitosa:**
```json
{
  "exito": true,
  "emailId": "resend-email-uuid"
}
```

**Respuesta fallida:**
```json
{
  "exito": false,
  "error": "mensaje de error descriptivo"
}
```

### 4.3 Flujo interno del handler

```
POST /send-mail
│
├── 1. Validar pedidoId requerido
│
├── 2. Consultar datos del pedido:
│      SELECT p.*, c.email, c.primer_nombre, c.primer_apellido
│      FROM st_pedidos p
│      JOIN pos_clientes c ON c.id = p.cliente_id
│      WHERE p.id = pedidoId
│
├── 3. Si es QA (APP_URL contiene "calidad"):
│      destinatario = ADMIN_EMAIL   (sobrescribe)
│    Sino:
│      destinatario = c.email
│
├── 4. Renderizar templateConfirmacion(pedido, cliente)
│
├── 5. POST a https://api.resend.com/emails
│      Headers:
│        Authorization: Bearer Deno.env.get('RESEND_API_KEY')
│        Content-Type: application/json
│      Body: {
│        from: Deno.env.get('RESEND_FROM_EMAIL'),
│        to: [destinatario],
│        subject: asunto,
│        html: templateRenderizado
│      }
│
└── 6. Retornar Response.json({ exito, emailId? })
```

### 4.4 Seguridad

- **`verify_jwt = false`** en `config.toml`. La funcion NO requiere auth porque es llamada desde el Store (usuario anonimo, sin JWT).
- La API Key de Resend solo existe en `Deno.env.get()`, nunca en codigo ni en el cliente.
- En QA, el destinatario se SOBRESCRIBE siempre con `ADMIN_EMAIL` para evitar fugas.

---

## 5. Template de Confirmacion

El template se define como una funcion dentro de `index.ts`. Recibe los datos del pedido y retorna un string HTML completo.

**Asunto:** `"Tu pedido #KBT-202606-1234 ha sido confirmado - OutletShop"`

**Variables disponibles:**
- `cliente.nombre` — Nombre del cliente
- `pedido.numero_pedido` — Ej. `KBT-202606-1234`
- `pedido.fecha_pedido` — Fecha del pedido
- `items[]` — Array con `nombre`, `cantidad`, `precio_unitario`, `subtotal`
- `pedido.subtotal` — Subtotal numerico
- `pedido.costo_envio` — Costo de envio
- `pedido.total` — Total numerico
- `pedido.estado` — Estado actual (PENDIENTE)
- `metodo_pago` — Metodo de pago seleccionado
- `APP_URL` — URL base para links

**Estructura HTML minima:**
```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
  <div style="background: #020617; padding: 24px; text-align: center;">
    <h1 style="color: white; margin: 0;">OutletShop</h1>
  </div>
  <div style="padding: 24px;">
    <h2>Gracias por tu compra, {{nombre}}!</h2>
    <p>Tu pedido <strong>{{numero_pedido}}</strong> ha sido recibido.</p>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f1f5f9;">
          <th style="padding: 8px; text-align: left;">Producto</th>
          <th style="padding: 8px; text-align: center;">Cant</th>
          <th style="padding: 8px; text-align: right;">Precio</th>
          <th style="padding: 8px; text-align: right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {{#items}}
        <tr>
          <td style="padding: 8px;">{{nombre}}</td>
          <td style="padding: 8px; text-align: center;">{{cantidad}}</td>
          <td style="padding: 8px; text-align: right;">${{precio_unitario}}</td>
          <td style="padding: 8px; text-align: right;">${{subtotal}}</td>
        </tr>
        {{/items}}
      </tbody>
    </table>
    <hr style="border: none; border-top: 1px solid #e2e8f0;">
    <p style="text-align: right;"><strong>Total: ${{total}}</strong></p>
    <p>Estado actual: <strong>{{estado}}</strong></p>
    <p>Metodo de pago: {{metodo_pago}}</p>
    <a href="{{app_url}}/pedido?id={{pedido_id}}"
       style="display: inline-block; background: #020617; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
      Ver mi pedido
    </a>
  </div>
</body>
</html>
```

**Nota de implementacion:** Dado que el template es inline en TypeScript, las variables se interpolan con template literals (`${}`) directamente, no con un motor de templates externo.

```typescript
function templateConfirmacion(pedido, cliente) {
  const itemsHtml = pedido.items.map(item => `
    <tr>
      <td>${item.nombre}</td>
      <td>${item.cantidad}</td>
      <td>$${item.precio_unitario}</td>
      <td>$${item.subtotal}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>...${itemsHtml}...`;
  return { subject, html };
}
```

---

## 6. Trigger de Envio (Checkout)

**Archivo:** `apps/store/js/paginas/checkout.js`

**Punto de insercion:** Despues de la creacion del detalle del pedido, antes del modal de exito.

**Codigo a agregar:**
```javascript
// Enviar correo de confirmacion
try {
  var resp = await fetch(__supabase.supabaseUrl + '/functions/v1/send-mail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pedidoId: pedidoId })
  });
  var result = await resp.json();
  if (!result.exito) {
    console.warn('Error al enviar correo de confirmacion:', result.error);
  }
} catch (err) {
  console.warn('Error al llamar a send-mail:', err);
}
// Continuar con el modal de exito (no bloquear si el email falla)
```

**Regla:** El email NO debe bloquear el flujo de checkout. Si falla, se muestra mensaje en consola pero el pedido ya esta creado. El usuario ve el modal de exito igualmente.

---

## 7. Manejo de Errores

### 7.1 Escenarios

| Escenario | Comportamiento |
|---|---|
| Resend API caido | Edge Function retorna `{ exito: false, error: "Resend: 503" }`. El checkout loggea el error. Sin reintento automatico. |
| Timeout (>10s) | Edge Function corta la conexion y retorna error. |
| Payload invalido | Edge Function retorna `{ exito: false }` con status 400. |
| Pedido no existe | Edge Function retorna `{ exito: false }` con status 404. |
| Resend rechaza API Key | Edge Function retorna error 401 de Resend. Se debe revisar `RESEND_API_KEY`. |
| Destinatario invalido | Resend rechaza el email. Edge Function retorna el error de Resend. |

### 7.2 Logging
- El Edge Function usa `console.log()` y `console.error()` para logging.
- Los logs son visibles en Supabase Dashboard → Edge Functions → Logs.
- No se persiste en DB (sin tabla de tracking).

---

## 8. Fase 2 (Ideas para versiones futuras)

| Funcionalidad | Descripcion |
|---|---|
| `st_notificaciones` | Tabla para tracking de envios, reintentos y auditoria. |
| Carrito abandonado | Cron semanal que consulta carritos en estado `ABANDONADO` con >3 dias de inactividad. |
| Notificaciones de cambio de estado | Correos automaticos cuando el pedido pasa a PAGADO, ENVIADO, ENTREGADO o CANCELADO. Requeriria Database Webhook en Supabase. |
| Templates externos | Archivos `.html` en `apps/store/emails/` cargados por el servidor. |
| Batch sending | Administrador puede enviar correos masivos (promociones, recordatorios). |

---

## 9. Checklist de Implementacion (para la version futura)

- [ ] Crear `supabase/functions/send-mail/index.ts` con el handler + template inline
- [ ] Configurar secrets en Supabase QA (`supabase secrets set ...`)
- [ ] Desplegar Edge Function (`supabase functions deploy send-mail`)
- [ ] Agregar llamado a send-mail en `checkout.js` despues de crear detalle
- [ ] Probar flujo completo en QA: checkout → correo de confirmacion recibido en admin email
- [ ] Documentar en `AGENTS.md` la nueva funcionalidad
