import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import { ensureCurrentMonthPaymentRow } from "@/server/actions/rent-payments";
import { RentPaymentsList } from "@/components/dashboard/rent-payments-list";

export default async function PagosAlquilerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { data: property } = await supabase
    .from("properties")
    .select("id, title, agency_id")
    .eq("id", id)
    .maybeSingle();

  if (!property || property.agency_id !== agencyId) {
    notFound();
  }

  const { data: tenancy } = await supabase
    .from("property_tenancies")
    .select("id, tenant_full_name")
    .eq("property_id", id)
    .eq("agency_id", agencyId)
    .eq("status", "activo")
    .maybeSingle();

  if (!tenancy) {
    notFound();
  }

  await ensureCurrentMonthPaymentRow(tenancy.id);

  const { data: payments } = await supabase
    .from("rent_payments")
    .select("id, period_month, amount, price_currency, status, paid_at")
    .eq("tenancy_id", tenancy.id)
    .order("period_month", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold">Pagos de alquiler</h1>
        <span className="text-zinc-600">
          {property.title} · {tenancy.tenant_full_name}
        </span>
      </div>
      <RentPaymentsList payments={payments ?? []} />
    </div>
  );
}
