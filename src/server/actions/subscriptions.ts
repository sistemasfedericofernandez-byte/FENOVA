"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { preApprovalPlanClient } from "@/lib/mercadopago";

/**
 * MercadoPago exige que `back_url` sea https. En desarrollo local
 * (NEXT_PUBLIC_SITE_URL=http://localhost:3000) usamos un placeholder https
 * válido solo para que la creación del plan no falle; no se llega a usar
 * en la práctica porque el webhook (que sí necesita URL pública real)
 * todavía no está configurado.
 */
function getBackUrl(path: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (siteUrl.startsWith("https://")) return `${siteUrl}${path}`;
  return `https://www.argentina-inmuebles.com${path}`;
}

/**
 * Crea un plan de suscripción (PreApprovalPlan) en MercadoPago con
 * external_reference = agency_id, y devuelve su link de pago (init_point).
 * Se crea uno nuevo por cada intento de checkout (no uno fijo por plan)
 * para poder identificar qué agencia pagó cuando llegue el webhook.
 */
export async function startSubscriptionCheckout(planSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "No autenticado" };

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("profile_id", user.id)
    .single();
  if (!agency) return { ok: false as const, error: "Agencia no encontrada" };

  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("id, name, price_ars")
    .eq("slug", planSlug)
    .eq("active", true)
    .single();
  if (!plan) return { ok: false as const, error: "Plan no encontrado" };

  // El SDK de MercadoPago no tipa `external_reference` en PreApprovalPlanRequest,
  // pero la API sí lo acepta y lo devuelve (confirmado contra /preapproval_plan).
  const preapprovalPlan = await preApprovalPlanClient.create({
    body: {
      reason: `Argentina Inmuebles — Plan ${plan.name}`,
      back_url: getBackUrl("/dashboard/suscripcion"),
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.price_ars,
        currency_id: "ARS",
      },
      external_reference: agency.id,
    } as Parameters<typeof preApprovalPlanClient.create>[0]["body"] & {
      external_reference: string;
    },
  });

  if (!preapprovalPlan.id || !preapprovalPlan.init_point) {
    return { ok: false as const, error: "No se pudo iniciar la suscripción" };
  }

  // La tabla `subscriptions` solo admite escritura de super_admin vía RLS
  // (una agencia no puede auto-otorgarse un plan); acá usamos el cliente
  // admin porque ya validamos la identidad del usuario arriba y el estado
  // que guardamos es "pausada" — la activación real solo la hace el
  // webhook cuando MercadoPago confirma el pago.
  const adminSupabase = createAdminClient();
  await adminSupabase.from("subscriptions").upsert(
    {
      agency_id: agency.id,
      plan_id: plan.id,
      status: "pausada",
      mercadopago_subscription_id: preapprovalPlan.id,
    },
    { onConflict: "agency_id" },
  );

  return { ok: true as const, checkoutUrl: preapprovalPlan.init_point };
}
