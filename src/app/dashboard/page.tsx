import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import { PageHeader, StatusBadge } from "@/components/dashboard/page-header";
import { buttonClass } from "@/lib/button-styles";
import { ArrowRightIcon, CheckIcon, PlusIcon } from "@/components/ui/icons";
import { formatArs } from "@/lib/utils";
import type { PriceCurrency } from "@/types/database.types";

const MONTH = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "UTC" });

function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card flex flex-col gap-1 p-5 transition-shadow hover:shadow-md ${
        highlight ? "!border-amber-400 !bg-amber-50" : ""
      }`}
    >
      <span className="text-3xl font-bold tracking-tight text-[#0d2740]">{value}</span>
      <span className="text-sm font-medium text-zinc-700">{label}</span>
    </Link>
  );
}

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const [
    { count: publishedCount },
    { count: rentedCount },
    { count: ownersCount },
    { count: propertiesCount },
    { data: activeTenancies },
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
    supabase.from("owners").select("id", { count: "exact", head: true }).eq("agency_id", agencyId),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("agency_id", agencyId),
    supabase
      .from("property_tenancies")
      .select("id, tenant_full_name, property_id")
      .eq("agency_id", agencyId)
      .eq("status", "activo"),
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

  const activeIds = (activeTenancies ?? []).map((t) => t.id);
  const { data: pendingPayments } = activeIds.length
    ? await supabase
        .from("rent_payments")
        .select("id, tenancy_id, period_month, amount, price_currency")
        .in("tenancy_id", activeIds)
        .eq("status", "pendiente")
        .lte("period_month", monthStartStr)
        .order("period_month", { ascending: true })
    : { data: [] };

  const propertyIds = [...new Set((activeTenancies ?? []).map((t) => t.property_id))];
  const { data: rentedProperties } = propertyIds.length
    ? await supabase.from("properties").select("id, title").in("id", propertyIds)
    : { data: [] };

  const tenancyById = new Map((activeTenancies ?? []).map((t) => [t.id, t]));
  const titleByProperty = new Map((rentedProperties ?? []).map((p) => [p.id, p.title]));
  const pendingCount = pendingPayments?.length ?? 0;

  const plan = (
    subscription as unknown as { subscription_plans: { name: string } | null } | null
  )?.subscription_plans;

  const steps = [
    {
      done: Boolean(agency?.logo_url),
      label: "Subí el logo de tu inmobiliaria",
      href: "/dashboard/perfil",
    },
    {
      done: (propertiesCount ?? 0) > 0,
      label: "Cargá tu primera propiedad",
      href: "/dashboard/propiedades/nueva",
    },
    {
      done: (ownersCount ?? 0) > 0,
      label: "Anotá a un propietario",
      href: "/dashboard/propietarios",
    },
    {
      done: agency?.verification_status === "aprobado",
      label: "Pedí el sello Propietario Seguro",
      href: "/dashboard/verificacion",
    },
  ];
  const doneSteps = steps.filter((s) => s.done).length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Hola, ${agency?.business_name ?? "bienvenido"}`}
        description="Este es el resumen de tu inmobiliaria. Desde acá llegás a todo lo importante."
        action={
          <Link href="/dashboard/propiedades/nueva" className={buttonClass("primary")}>
            <PlusIcon width={18} height={18} />
            Publicar propiedad
          </Link>
        }
      />

      {doneSteps < steps.length ? (
        <section className="card flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-[#0d2740]">Terminá de configurar tu cuenta</h2>
              <p className="text-sm text-zinc-700">
                {doneSteps} de {steps.length} pasos listos
              </p>
            </div>
            <div className="h-2.5 w-28 shrink-0 overflow-hidden rounded-full bg-zinc-200 sm:w-40">
              <div
                className="h-full rounded-full bg-[#b6862f]"
                style={{ width: `${(doneSteps / steps.length) * 100}%` }}
              />
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {steps.map((step) => (
              <li key={step.label}>
                <Link
                  href={step.href}
                  className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-[15px] font-medium transition-colors ${
                    step.done
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-zinc-300 bg-white text-zinc-900 hover:border-[#163a5c]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      step.done ? "bg-emerald-600 text-white" : "border-2 border-zinc-400"
                    }`}
                  >
                    {step.done ? <CheckIcon width={14} height={14} strokeWidth={3} /> : null}
                  </span>
                  <span className={step.done ? "line-through decoration-emerald-700/50" : ""}>
                    {step.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Propiedades publicadas" value={publishedCount ?? 0} href="/dashboard/propiedades" />
        <StatCard label="Propiedades alquiladas" value={rentedCount ?? 0} href="/dashboard/alquileres" />
        <StatCard label="Contratos activos" value={activeIds.length} href="/dashboard/alquileres" />
        <StatCard
          label="Cobros pendientes"
          value={pendingCount}
          href="/dashboard/alquileres"
          highlight={pendingCount > 0}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0d2740]">Cobros de alquiler por revisar</h2>
          <Link
            href="/dashboard/alquileres"
            className="flex items-center gap-1 text-sm font-semibold text-[#163a5c] underline underline-offset-4"
          >
            Ver todos <ArrowRightIcon width={16} height={16} />
          </Link>
        </div>

        {pendingCount === 0 ? (
          <div className="card flex items-center gap-3 p-5 text-[15px] text-zinc-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckIcon />
            </span>
            {activeIds.length
              ? "Todo al día: no hay cobros pendientes."
              : "Cuando alquiles una propiedad, acá vas a ver los cobros de cada mes."}
          </div>
        ) : (
          <ul className="card divide-y divide-zinc-200">
            {pendingPayments!.slice(0, 5).map((payment) => {
              const tenancy = tenancyById.get(payment.tenancy_id);
              const title = tenancy ? titleByProperty.get(tenancy.property_id) : null;
              const label = MONTH.format(new Date(`${payment.period_month}T00:00:00Z`));
              return (
                <li key={payment.id}>
                  <Link
                    href={`/dashboard/propiedades/${tenancy?.property_id}/alquilar/pagos`}
                    className="flex flex-col gap-1 p-4 hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="flex flex-col">
                      <span className="font-semibold text-zinc-900">{title ?? "Propiedad"}</span>
                      <span className="text-sm text-zinc-700">
                        {tenancy?.tenant_full_name} · {label}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      {payment.amount != null ? (
                        <span className="font-semibold text-zinc-900">
                          {formatArs(payment.amount, (payment.price_currency ?? "ARS") as PriceCurrency)}
                        </span>
                      ) : null}
                      <StatusBadge tone="amber">Pendiente</StatusBadge>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/suscripcion" className="card flex flex-col gap-1 p-5 hover:shadow-md">
          <span className="text-sm font-semibold text-zinc-700">Suscripción</span>
          <span className="text-lg font-bold text-[#0d2740]">{plan?.name ?? "Sin plan activo"}</span>
          <span className="text-sm text-zinc-700">
            {subscription?.status === "activa" && subscription.current_period_end
              ? `Próximo cobro: ${new Date(subscription.current_period_end).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  timeZone: "UTC",
                })}`
              : "Elegí un plan para publicar sin límites."}
          </span>
        </Link>
        <Link href="/dashboard/verificacion" className="card flex flex-col gap-1 p-5 hover:shadow-md">
          <span className="text-sm font-semibold text-zinc-700">Propietario Seguro</span>
          <span className="text-lg font-bold text-[#0d2740]">
            {agency?.verification_status === "aprobado"
              ? "Verificado"
              : agency?.verification_status === "pendiente"
                ? "En revisión"
                : "Sin verificar"}
          </span>
          <span className="text-sm text-zinc-700">
            {agency?.verification_status === "aprobado"
              ? "Tus avisos muestran el sello de confianza."
              : "El sello genera más confianza en tus avisos."}
          </span>
        </Link>
      </section>
    </div>
  );
}
