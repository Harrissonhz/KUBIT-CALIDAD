import { createClient } from "@supabase/supabase-js";

const COSTO_ENVIO = 9900;

interface CartItem {
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface ClienteData {
  nombre: string;
  email: string;
  telefono?: string;
}

interface DireccionData {
  direccion: string;
  ciudad: string;
  departamento: string;
}

interface RequestBody {
  items: CartItem[];
  cliente: ClienteData;
  direccion: DireccionData;
  metodoPago: string;
}

var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apiKey",
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    var body: RequestBody = await req.json();
    var { items, cliente, direccion, metodoPago } = body;

    if (!items || !items.length) {
      return jsonResponse({ error: "Carrito vacío" }, 400);
    }

    if (!cliente?.nombre || !cliente?.email) {
      return jsonResponse({ error: "Nombre y email requeridos" }, 400);
    }

    if (!direccion?.direccion || !direccion?.ciudad || !direccion?.departamento) {
      return jsonResponse({ error: "Dirección completa requerida" }, 400);
    }

    var supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    var serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    var supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Create or find guest client
    var { data: existingClients, error: searchErr } = await supabase
      .from("pos_clientes")
      .select("id")
      .eq("email", cliente.email)
      .is("deleted_at", null)
      .limit(1);

    if (searchErr) throw new Error("Error al buscar cliente: " + searchErr.message);

    // Split full name into first name and last name
    var partesNombre = (cliente.nombre || "").trim().split(" ");
    var primerNombre = partesNombre[0] || "Invitado";
    var primerApellido = partesNombre.slice(1).join(" ") || "Store";

    var clienteId: string;
    if (existingClients && existingClients.length > 0) {
      clienteId = existingClients[0].id;
    } else {
      var { data: newClient, error: clientErr } = await supabase
        .from("pos_clientes")
        .insert({
          tipo_id: "NIT",
          numero_id: "CG-" + Date.now().toString(36).toUpperCase(),
          primer_nombre: primerNombre,
          primer_apellido: primerApellido,
          email: cliente.email,
          celular: cliente.telefono || null,
        })
        .select("id")
        .single();

      if (clientErr) throw new Error("Error al crear cliente: " + clientErr.message);
      clienteId = newClient.id;
    }

    // 2. Create shipping address
    var { data: newAddress, error: addrErr } = await supabase
      .from("st_direcciones")
      .insert({
        cliente_id: clienteId,
        tipo: "envio",
        nombre_destinatario: cliente.nombre,
        telefono: cliente.telefono || null,
        direccion: direccion.direccion,
        ciudad: direccion.ciudad,
        departamento: direccion.departamento,
        pais: "Colombia",
      })
      .select("id")
      .single();

    if (addrErr) throw new Error("Error al crear dirección: " + addrErr.message);

    // 3. Calculate totals
    var totalItems = items.reduce((sum, i) => sum + (i.cantidad || 1), 0);
    var totalSubtotal = items.reduce((sum, i) => sum + (i.precio || 0) * (i.cantidad || 1), 0);
    var total = totalSubtotal + COSTO_ENVIO;

    // 4. Generate order number
    var ahora = new Date();
    var y = ahora.getFullYear();
    var m = String(ahora.getMonth() + 1).padStart(2, "0");
    var r = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
    var numeroPedido = "KBT-" + y + m + "-" + r;

    // 5. Create order
    var { data: newOrder, error: orderErr } = await supabase
      .from("st_pedidos")
      .insert({
        numero_pedido: numeroPedido,
        cliente_id: clienteId,
        direccion_envio_id: newAddress.id,
        direccion_facturacion_id: newAddress.id,
        fecha_pedido: ahora.toISOString().split("T")[0],
        estado: "PENDIENTE",
        subtotal: totalSubtotal,
        descuento: 0,
        costo_envio: COSTO_ENVIO,
        total: total,
        notas: "Método de pago: " + (metodoPago || "No especificado"),
      })
      .select("id, numero_pedido")
      .single();

    if (orderErr) throw new Error("Error al crear pedido: " + orderErr.message);

    // 6. Resolve producto_detalle_id for each item and create order details
    var detalleData: Record<string, unknown>[] = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var cant = item.cantidad || 1;
      var precio = item.precio || 0;

      // Query the first active detail for this product
      var { data: detalle, error: detErr } = await supabase
        .from("pos_productos_detalle")
        .select("id")
        .eq("producto_id", item.productoId)
        .is("deleted_at", null)
        .order("orden", { ascending: true, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      if (detErr) throw new Error("Error al buscar detalle del producto: " + detErr.message);
      if (!detalle) throw new Error("Producto sin detalle disponible: " + (item.nombre || "ID " + item.productoId));

      detalleData.push({
        pedido_id: newOrder.id,
        producto_detalle_id: detalle.id,
        cantidad: cant,
        precio_unitario: precio,
        subtotal: cant * precio,
        total: cant * precio,
      });
    }

    var { error: detailErr } = await supabase
      .from("st_pedidos_detalle")
      .insert(detalleData);

    if (detailErr) throw new Error("Error al crear detalle del pedido: " + detailErr.message);

    return jsonResponse({
      success: true,
      pedido_id: newOrder.id,
      numero_pedido: newOrder.numero_pedido,
      total: total,
      total_items: totalItems,
      email: cliente.email,
    }, 200);
  } catch (err: any) {
    console.error("create-pedido error:", err);
    return jsonResponse({ error: err.message || "Error interno del servidor" }, 500);
  }
});
