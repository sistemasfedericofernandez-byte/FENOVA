import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Registra un evento anónimo de vista o clic en WhatsApp para una
 * propiedad. Público y sin autenticación (lo dispara cualquier visitante),
 * por eso usa el cliente admin en vez de depender de RLS de sesión.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const propertyId = body?.propertyId;
  const eventType = body?.eventType;

  if (
    typeof propertyId !== "string" ||
    (eventType !== "view" && eventType !== "whatsapp_click")
  ) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();

  await supabase.from("property_events").insert({
    property_id: propertyId,
    event_type: eventType,
  });

  const column =
    eventType === "view" ? "views_count" : "whatsapp_clicks_count";
  await supabase.rpc("increment_property_counter", {
    p_property_id: propertyId,
    p_column: column,
  });

  return NextResponse.json({ ok: true });
}
