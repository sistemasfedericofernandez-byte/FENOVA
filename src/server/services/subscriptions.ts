import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Interruptor temporal para el lanzamiento comercial: mientras se sale a
 * vender la plataforma a inmobiliarias, se les permite publicar sin haber
 * pagado todavía. Poner REQUIRE_ACTIVE_SUBSCRIPTION=true en las variables
 * de entorno (y redeploy) para volver a exigir suscripción activa.
 */
const REQUIRE_ACTIVE_SUBSCRIPTION =
  process.env.REQUIRE_ACTIVE_SUBSCRIPTION !== "false";

const FREE_PERIOD_LISTING_LIMIT = 999;

/**
 * Determina si una agencia puede publicar una propiedad más, según el
 * límite de su plan activo. Centralizado acá porque se usa tanto al crear
 * como al despausar una propiedad.
 */
export async function canPublishMoreListings(
  supabase: SupabaseServerClient,
  agencyId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  if (!REQUIRE_ACTIVE_SUBSCRIPTION) {
    return { allowed: true };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, subscription_plans(max_active_listings)")
    .eq("agency_id", agencyId)
    .eq("status", "activa")
    .maybeSingle();

  if (!subscription) {
    return { allowed: false, reason: "No hay una suscripción activa." };
  }

  const maxActiveListings = (
    subscription as unknown as {
      subscription_plans: { max_active_listings: number } | null;
    }
  ).subscription_plans?.max_active_listings;

  if (!maxActiveListings) {
    return { allowed: false, reason: "Plan sin límite configurado." };
  }

  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .eq("status", "publicada");

  if ((count ?? 0) >= maxActiveListings) {
    return {
      allowed: false,
      reason: `Alcanzaste el límite de ${maxActiveListings} publicaciones activas de tu plan.`,
    };
  }

  return { allowed: true };
}

/**
 * Info de plan/capacidad usada por la carga masiva: cuántas publicaciones
 * más puede activar la agencia ahora mismo, y si su plan habilita CSV/Excel.
 */
export async function getAgencyPlanCapacity(
  supabase: SupabaseServerClient,
  agencyId: string,
): Promise<{
  hasActivePlan: boolean;
  allowsCsvBulkUpload: boolean;
  remainingActiveListings: number;
}> {
  const { count: publishedCount } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("agency_id", agencyId)
    .eq("status", "publicada");

  if (!REQUIRE_ACTIVE_SUBSCRIPTION) {
    return {
      hasActivePlan: true,
      allowsCsvBulkUpload: true,
      remainingActiveListings: Math.max(
        0,
        FREE_PERIOD_LISTING_LIMIT - (publishedCount ?? 0),
      ),
    };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, subscription_plans(max_active_listings, allows_csv_bulk_upload)")
    .eq("agency_id", agencyId)
    .eq("status", "activa")
    .maybeSingle();

  const plan = (
    subscription as unknown as {
      subscription_plans: {
        max_active_listings: number;
        allows_csv_bulk_upload: boolean;
      } | null;
    } | null
  )?.subscription_plans;

  if (!subscription || !plan) {
    return {
      hasActivePlan: false,
      allowsCsvBulkUpload: false,
      remainingActiveListings: 0,
    };
  }

  return {
    hasActivePlan: true,
    allowsCsvBulkUpload: plan.allows_csv_bulk_upload,
    remainingActiveListings: Math.max(
      0,
      plan.max_active_listings - (publishedCount ?? 0),
    ),
  };
}
