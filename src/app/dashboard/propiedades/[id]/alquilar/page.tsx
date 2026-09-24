import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { decryptField } from "@/lib/encryption";
import { TenancyForm } from "@/components/dashboard/tenancy-form";

export default async function AlquilarPropiedadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("profile_id", user?.id ?? "")
    .maybeSingle();

  const { data: property } = await supabase
    .from("properties")
    .select("id, title, agency_id")
    .eq("id", id)
    .maybeSingle();

  if (!property || !agency || property.agency_id !== agency.id) {
    notFound();
  }

  const { data: tenancy } = await supabase
    .from("property_tenancies")
    .select(
      "id, tenant_full_name, tenant_dni, guarantor_full_name, guarantor_dni, monthly_rent_amount, price_currency, start_date, notes",
    )
    .eq("property_id", id)
    .eq("agency_id", agency.id)
    .eq("status", "activo")
    .maybeSingle();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold">
          {tenancy ? "Contrato de alquiler" : "Marcar como alquilada"}
        </h1>
        <span className="text-zinc-600">{property.title}</span>
      </div>
      <TenancyForm
        propertyId={property.id}
        activeTenancy={
          tenancy
            ? {
                id: tenancy.id,
                tenantFullName: tenancy.tenant_full_name,
                tenantDni: tenancy.tenant_dni ? decryptField(tenancy.tenant_dni) : null,
                guarantorFullName: tenancy.guarantor_full_name,
                guarantorDni: tenancy.guarantor_dni ? decryptField(tenancy.guarantor_dni) : null,
                monthlyRentAmount: tenancy.monthly_rent_amount,
                priceCurrency: tenancy.price_currency,
                startDate: tenancy.start_date,
                notes: tenancy.notes,
              }
            : null
        }
      />
    </div>
  );
}
