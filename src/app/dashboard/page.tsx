import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
    >
      <span className="text-sm text-zinc-600">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
    </Link>
  );
}

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const currentMonthStart = new Date();
  currentMonthStart.setUTCDate(1);
  const currentMonthStartStr = currentMonthStart.toISOString().slice(0, 10);

  const [
    { count: publishedCount },
    { count: rentedCount },
    { count: activeTenanciesCount },
    { count: pendingPaymentsCount },
    { count: ownersCount },
    { data: agency },
    { data: subscription },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .eq("status", "publicada"),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .eq("status", "alquilada"),
    supabase
      .from("property_tenancies")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .eq("status", "activo"),
    supabase
      .from("rent_payments")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId)
      .eq("status", "pendiente")
      .lte("period_month", currentMonthStartStr),
    supabase
      .from("owners")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", agencyId),
    supabase
      .from("agencies")
      .select("business_name, logo_url, verification_status")
      .eq("id", agencyId)
      .single(),
    supabase
      .from("subscriptions")
      .select("status, current_period_end, subscription_plans(name)")
      .eq("agency_id", agencyId)
      .maybeSingle(),
  ]);

  const plan = (
    subscription as unknown as {
      subscription_plans: { name: string } | null;
    } | null
  )?.subscription_plans;

  const nextSteps: { label: string; href: string }[] = [];
  if (!ownersCount) {
    nextSteps.push({ label: "Cargá tu primer propietario", href: "/dashboard/propietarios" });
  }
  if (!agency?.logo_url) {
    nextSteps.push({ label: "Subí el logo de tu inmobiliaria", href: "/dashboard/perfil" });
  }
  if (agency?.verification_status !== "aprobado") {
    nextSteps.push({ label: "Solicitá el sello Propietario Seguro", href: "/dashboard/verificacion" });
  }
  if (!publishedCount) {
    nextSteps.push({ label: "Publicá tu primera propiedad", href: "/dashboard/propiedades/nueva" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold">
          Hola, {agency?.business_name ?? "inmobiliaria"}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Panel de gestión de tu inmobiliaria en PropiMarket.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Propiedades publicadas"
          value={String(publishedCount ?? 0)}
          href="/dashboard/propiedades"
        />
        <StatCard
          label="Propiedades alquiladas"
          value={String(rentedCount ?? 0)}
          href="/dashboard/propiedades"
        />
        <StatCard
          label="Contratos activos"
          value={String(activeTenanciesCount ?? 0)}
          href="/dashboard/propiedades"
        />
        <StatCard
          label="Cobros pendientes"
          value={String(pendingPaymentsCount ?? 0)}
          href="/dashboard/propiedades"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <span className="text-sm text-zinc-600">Suscripción</span>
          <span className="font-medium">
            {plan?.name ?? "Sin plan activo"}
            {subscription?.status ? ` · ${subscription.status}` : ""}
          </span>
          <Link
            href="/dashboard/suscripcion"
            className="text-sm underline underline-offset-4"
          >
            Ver detalle
          </Link>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <span className="text-sm text-zinc-600">Propietario Seguro</span>
          <span className="font-medium">
            {agency?.verification_status === "aprobado" ? "Verificado" : "No verificado"}
          </span>
          <Link
            href="/dashboard/verificacion"
            className="text-sm underline underline-offset-4"
          >
            Ver detalle
          </Link>
        </div>
      </div>

      {nextSteps.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
          <span className="text-sm font-medium">Próximos pasos</span>
          <ul className="flex flex-col gap-1">
            {nextSteps.map((step) => (
              <li key={step.href}>
                <Link href={step.href} className="text-sm underline underline-offset-4">
                  {step.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
