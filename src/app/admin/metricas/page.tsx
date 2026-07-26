import { createClient } from "@/lib/supabase/server";
import { formatArs } from "@/lib/utils";

function thirtyDaysAgoIso() {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function MetricasAdminPage() {
  const supabase = await createClient();

  const [
    { count: totalAgencies },
    { count: totalProperties },
    { count: publishedProperties },
    { data: activeSubscriptions },
    { data: approvedPayments },
    { count: newAgencies30d },
  ] = await Promise.all([
    supabase.from("agencies").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("status", "publicada"),
    supabase
      .from("subscriptions")
      .select("plan_id, subscription_plans(price_ars)")
      .eq("status", "activa"),
    supabase.from("payments").select("amount_ars").eq("status", "aprobado"),
    supabase
      .from("agencies")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgoIso()),
  ]);

  const mrr = (activeSubscriptions ?? []).reduce((acc, s) => {
    const price = (
      s as unknown as { subscription_plans: { price_ars: number } | null }
    ).subscription_plans?.price_ars;
    return acc + (price ?? 0);
  }, 0);

  const totalBilled = (approvedPayments ?? []).reduce(
    (acc, p) => acc + p.amount_ars,
    0,
  );

  const tiles = [
    { label: "Agencias registradas", value: totalAgencies ?? 0 },
    { label: "Altas últimos 30 días", value: newAgencies30d ?? 0 },
    { label: "Suscripciones activas", value: activeSubscriptions?.length ?? 0 },
    { label: "MRR estimado", value: formatArs(mrr, "ARS") },
    { label: "Propiedades totales", value: totalProperties ?? 0 },
    { label: "Propiedades publicadas", value: publishedProperties ?? 0 },
    { label: "Facturación cobrada (pagos aprobados)", value: formatArs(totalBilled, "ARS") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Métricas globales</h1>
      <p className="text-zinc-400">Facturación, altas de agencias y planes activos.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-zinc-800 p-4">
            <p className="text-2xl font-bold">{tile.value}</p>
            <p className="text-sm text-zinc-400">{tile.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
