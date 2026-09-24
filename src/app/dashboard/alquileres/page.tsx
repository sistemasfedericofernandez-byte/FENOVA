import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import { PageHeader, StatusBadge } from "@/components/dashboard/page-header";
import { buttonClass } from "@/lib/button-styles";
import { KeyIcon } from "@/components/ui/icons";
import { formatArs } from "@/lib/utils";
import type { PriceCurrency } from "@/types/database.types";

const DATE = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function AlquileresPage() {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const { data: tenancies } = await supabase
    .from("property_tenancies")
    .select("id, property_id, status, tenant_full_name, monthly_rent_amount, price_currency, start_date, end_date")
    .eq("agency_id", agencyId)
    .order("start_date", { ascending: false });

  const propertyIds = [...new Set((tenancies ?? []).map((t) => t.property_id))];
  const activeIds = (tenancies ?? []).filter((t) => t.status === "activo").map((t) => t.id);

  const [{ data: properties }, { data: pending }] = await Promise.all([
    propertyIds.length
      ? supabase.from("properties").select("id, title").in("id", propertyIds)
      : Promise.resolve({ data: [] }),
    activeIds.length
      ? supabase
          .from("rent_payments")
          .select("tenancy_id")
          .in("tenancy_id", activeIds)
          .eq("status", "pendiente")
          .lte("period_month", monthStartStr)
      : Promise.resolve({ data: [] }),
  ]);

  const titleById = new Map((properties ?? []).map((p) => [p.id, p.title]));
  const pendingByTenancy = new Map<string, number>();
  for (const row of pending ?? []) {
    pendingByTenancy.set(row.tenancy_id, (pendingByTenancy.get(row.tenancy_id) ?? 0) + 1);
  }

  const active = (tenancies ?? []).filter((t) => t.status === "activo");
  const finished = (tenancies ?? []).filter((t) => t.status === "finalizado");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Alquileres"
        description="Tus contratos vigentes y el control de cobros de cada mes. Para sumar uno, entrá a una propiedad y tocá “Marcar alquilada”."
        action={
          <Link href="/dashboard/propiedades" className={buttonClass("secondary")}>
            Ir a mis propiedades
          </Link>
        }
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-[#0d2740]">Contratos vigentes</h2>
        {!active.length ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dfe7ee] text-[#163a5c]">
              <KeyIcon width={26} height={26} />
            </span>
            <p className="max-w-sm text-[15px] text-zinc-700">
              Todavía no tenés alquileres cargados. Cuando alquiles una propiedad, registrá al
              inquilino y controlá cada cobro desde acá.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {active.map((t) => {
              const pendingCount = pendingByTenancy.get(t.id) ?? 0;
              return (
                <li key={t.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="truncate text-base font-bold text-zinc-900">
                      {titleById.get(t.property_id) ?? "Propiedad"}
                    </h3>
                    <p className="text-sm text-zinc-700">
                      Inquilino: <strong className="font-semibold text-zinc-900">{t.tenant_full_name}</strong>
                    </p>
                    <p className="text-sm text-zinc-700">
                      {t.monthly_rent_amount != null
                        ? `${formatArs(t.monthly_rent_amount, (t.price_currency ?? "ARS") as PriceCurrency)} por mes`
                        : "Sin monto cargado"}
                      {t.start_date ? ` · desde ${DATE.format(new Date(`${t.start_date}T00:00:00Z`))}` : ""}
                    </p>
                    <div className="pt-1">
                      {pendingCount > 0 ? (
                        <StatusBadge tone="amber">
                          {pendingCount} {pendingCount === 1 ? "cobro pendiente" : "cobros pendientes"}
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone="green">Al día</StatusBadge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
                    <Link
                      href={`/dashboard/propiedades/${t.property_id}/alquilar/pagos`}
                      className={buttonClass("primary")}
                    >
                      Ver cobros
                    </Link>
                    <Link
                      href={`/dashboard/propiedades/${t.property_id}/alquilar`}
                      className={buttonClass("secondary")}
                    >
                      Ver contrato
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {finished.length ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-[#0d2740]">Contratos finalizados</h2>
          <ul className="card divide-y divide-zinc-200">
            {finished.map((t) => (
              <li key={t.id} className="flex flex-col gap-0.5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-zinc-900">
                  {titleById.get(t.property_id) ?? "Propiedad"}
                </span>
                <span className="text-sm text-zinc-700">
                  {t.start_date ? DATE.format(new Date(`${t.start_date}T00:00:00Z`)) : "—"} →{" "}
                  {t.end_date ? DATE.format(new Date(`${t.end_date}T00:00:00Z`)) : "—"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
