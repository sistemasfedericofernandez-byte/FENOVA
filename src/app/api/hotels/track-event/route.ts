import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Registra un evento anónimo de vista o clic en WhatsApp para un hotel.
 * Público y sin autenticación, igual que /api/properties/track-event.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const hotelId = body?.hotelId;
  const eventType = body?.eventType;

  if (
    typeof hotelId !== "string" ||
    (eventType !== "view" && eventType !== "whatsapp_click")
  ) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();

  await supabase.from("hotel_events").insert({
    hotel_id: hotelId,
    event_type: eventType,
  });

  const column = eventType === "view" ? "views_count" : "whatsapp_clicks_count";
  await supabase.rpc("increment_hotel_counter", {
    p_hotel_id: hotelId,
    p_column: column,
  });

  return NextResponse.json({ ok: true });
}
