import { createClient } from "@/lib/supabase/server";
import { SubscriptionPlans } from "@/components/dashboard/subscription-plans";

const STATUS_LABEL: Record<string, string> = {
  activa: "Activa",
  pausada: "Pausada (esperando confirmación de pago)",
  vencida: "Vencida",
  cancelada: "Cancelada",
};

export default async function SuscripcionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plans } = await supabase
    .from("subscription_plans")
    .select(
      "id, slug, name, price_ars, max_active_listings, allows_csv_bulk_upload, allows_advanced_stats",
    )
    .eq("active", true)
    .order("price_ars", { ascending: true });

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("profile_id", user?.id ?? "")
    .maybeSingle();

  const { data: subscription } = agency
    ? await supabase
        .from("subscriptions")
        .select("plan_id, status")
        .eq("agency_id", agency.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Mi suscripción</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Elegí un plan para poder publicar propiedades.
        </p>
      </div>

      {subscription ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Estado actual: <strong>{STATUS_LABEL[subscription.status] ?? subscription.status}</strong>
        </p>
      ) : null}

      <SubscriptionPlans
        plans={plans ?? []}
        currentPlanId={
          subscription?.status === "activa" ? subscription.plan_id : null
        }
      />
    </div>
  );
}
