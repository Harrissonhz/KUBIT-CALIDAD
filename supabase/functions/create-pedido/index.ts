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

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    var body: RequestBody = await req.json();
    var { items, cliente, direccion, metodoPago } = body;

    if (!items || !items.length) {
      return new Response(JSON.stringify({ error: "Carrito vacío" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!cliente?.nombre || !cliente?.email) {
      return new Response(JSON.stringify({ error: "Nombre y email requeridos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!direccion?.direccion || !direccion?.ciudad || !direccion?.departamento) {
      return new Response(JSON.stringify({ error: "Dirección completa requerida" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
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

    // 6. Create order details
    var detalleData = items.map((item) => ({
      pedido_id: newOrder.id,
      producto_detalle_id: item.productoId,
      cantidad: item.cantidad || 1,
      precio_unitario: item.precio || 0,
      subtotal: (item.cantidad || 1) * (item.precio || 0),
      total: (item.cantidad || 1) * (item.precio || 0),
    }));

    var { error: detailErr } = await supabase
      .from("st_pedidos_detalle")
      .insert(detalleData);

    if (detailErr) throw new Error("Error al crear detalle del pedido: " + detailErr.message);

    return new Response(
      JSON.stringify({
        success: true,
        pedido_id: newOrder.id,
        numero_pedido: newOrder.numero_pedido,
        total: total,
        total_items: totalItems,
        email: cliente.email,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("create-pedido error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
