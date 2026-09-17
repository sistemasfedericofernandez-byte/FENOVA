import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { formatArs } from "@/lib/utils";

const REMINDER_DAYS_BEFORE = 3;

/**
 * Busca suscripciones activas cuyo próximo débito automático cae dentro de
 * los próximos REMINDER_DAYS_BEFORE días y todavía no tienen recordatorio
 * mandado para ese período, y les avisa por email. Pensado para correr una
 * vez por día vía cron (ver /api/cron/subscription-reminders).
 *
 * El objetivo es reducir cobros rechazados por falta de fondos en la
 * tarjeta — Mercado Pago se queda con su comisión igual si el cobro se
 * rechaza, así que avisar antes ayuda a no perder ese cobro del mes.
 */
export async function sendUpcomingRenewalReminders() {
  const supabase = createAdminClient();

  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + REMINDER_DAYS_BEFORE);

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(
      "id, agency_id, current_period_end, renewal_reminder_period_end, subscription_plans(name, price_ars), agencies(business_name, profile_id)",
    )
    .eq("status", "activa")
    .not("current_period_end", "is", null)
    .lte("current_period_end", windowEnd.toISOString())
    .gte("current_period_end", now.toISOString());

  if (error) return { sent: 0, error: error.message };
  if (!subscriptions?.length) return { sent: 0 };

  let sent = 0;

  for (const subscription of subscriptions) {
    const periodEndDate = (subscription.current_period_end as string).slice(0, 10);

    if (subscription.renewal_reminder_period_end === periodEndDate) {
      continue; // ya se mandó el recordatorio para este período
    }

    const plan = subscription.subscription_plans as unknown as {
      name: string;
      price_ars: number;
    } | null;
    const agency = subscription.agencies as unknown as {
      business_name: string;
      profile_id: string;
    } | null;

    if (!plan || !agency) continue;

    const { data: authUser } = await supabase.auth.admin.getUserById(agency.profile_id);
    const email = authUser?.user?.email;
    if (!email) continue;

    const formattedDate = new Date(subscription.current_period_end as string).toLocaleDateString(
      "es-AR",
      { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
    );

    const result = await sendEmail({
      to: email,
      subject: `Tu suscripción a PropiMarket se renueva el ${formattedDate}`,
      html: `
        <p>Hola ${agency.business_name},</p>
        <p>Te avisamos que el <strong>${formattedDate}</strong> Mercado Pago va a debitar
        automáticamente <strong>${formatArs(plan.price_ars, "ARS")}</strong> correspondiente
        a tu plan <strong>${plan.name}</strong> en PropiMarket.</p>
        <p>Si tu tarjeta no tiene fondos disponibles ese día, el cobro se puede rechazar y
        tus publicaciones quedarían pausadas hasta regularizar el pago.</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/suscripcion">Ver mi suscripción</a></p>
      `,
    });

    if (result.sent) {
      await supabase
        .from("subscriptions")
        .update({ renewal_reminder_period_end: periodEndDate })
        .eq("id", subscription.id);
      sent += 1;
    }
  }

  return { sent };
}
