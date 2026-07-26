import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { paymentClient } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Verifica la firma del webhook según el algoritmo documentado por MercadoPago:
 * https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
function isValidSignature(request: Request, dataId: string): boolean {
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!xSignature || !xRequestId || !secret) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key.trim(), value?.trim()];
    }),
  );

  const ts = parts.ts;
  const receivedHash = parts.v1;
  if (!ts || !receivedHash) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(receivedHash),
  );
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId =
    url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "";

  if (!dataId || !isValidSignature(request, dataId)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const topic = url.searchParams.get("type") ?? url.searchParams.get("topic");
  if (topic !== "payment") {
    return NextResponse.json({ received: true });
  }

  const payment = await paymentClient.get({ id: dataId });

  // Creamos el checkout como un `preapproval_plan` con external_reference =
  // agency_id (ver server/actions/subscriptions.ts — un `preapproval`
  // standalone da 500 en esta cuenta). Ese external_reference se propaga al
  // preapproval real y de ahí a cada payment, así que es la forma confiable
  // de identificar qué agencia pagó — no hay que buscar por
  // mercadopago_subscription_id porque esa columna guarda el ID del *plan*,
  // no el de la suscripción real que MercadoPago crea al completar el pago.
  const agencyId = payment.external_reference;

  if (!agencyId) {
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, agency_id")
    .eq("agency_id", agencyId)
    .single();

  if (!subscription) {
    return NextResponse.json({ received: true });
  }

  const paymentStatus =
    payment.status === "approved"
      ? "aprobado"
      : payment.status === "refunded"
        ? "reembolsado"
        : payment.status === "pending" || payment.status === "in_process"
          ? "pendiente"
          : "rechazado";

  await supabase.from("payments").upsert(
    {
      subscription_id: subscription.id,
      mercadopago_payment_id: String(payment.id),
      status: paymentStatus,
      amount_ars: payment.transaction_amount ?? 0,
      paid_at: payment.date_approved ?? null,
      raw_webhook_payload: payment as unknown as Record<string, unknown>,
    },
    { onConflict: "mercadopago_payment_id" },
  );

  if (paymentStatus === "aprobado") {
    await supabase
      .from("subscriptions")
      .update({ status: "activa" })
      .eq("id", subscription.id);
  } else if (paymentStatus === "rechazado") {
    // Regla de negocio: pago rechazado => las propiedades de la agencia pasan a "oculta".
    await supabase
      .from("subscriptions")
      .update({ status: "vencida" })
      .eq("id", subscription.id);

    await supabase
      .from("properties")
      .update({ status: "oculta" })
      .eq("agency_id", subscription.agency_id)
      .eq("status", "publicada");
  }

  return NextResponse.json({ received: true });
}
