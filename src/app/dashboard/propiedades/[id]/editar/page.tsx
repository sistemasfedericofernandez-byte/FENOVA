import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { EditPropertyForm } from "@/components/dashboard/edit-property-form";

export default async function EditarPropiedadPage({
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
    .select(
      "id, title, description, operation_type, property_type, neighborhood_id, owner_id, address_text, lat, lng, price_amount, price_currency, surface_total_m2, bedrooms, bathrooms, status, agency_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!property || !agency || property.agency_id !== agency.id) {
    notFound();
  }

  const [{ data: neighborhoods }, { data: images }, { data: owners }] = await Promise.all([
    supabase.from("neighborhoods").select("id, name").eq("active", true).order("name"),
    supabase
      .from("property_images")
      .select("id, url")
      .eq("property_id", id)
      .order("sort_order", { ascending: true }),
    supabase.from("owners").select("id, full_name").eq("agency_id", agency.id).order("full_name"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Editar propiedad" />
      <EditPropertyForm
        propertyId={property.id}
        initial={{
          title: property.title,
          description: property.description,
          operationType: property.operation_type,
          propertyType: property.property_type,
          neighborhoodId: property.neighborhood_id,
          ownerId: property.owner_id,
          addressText: property.address_text,
          lat: property.lat,
          lng: property.lng,
          priceAmount: property.price_amount,
          priceCurrency: property.price_currency,
          surfaceTotalM2: property.surface_total_m2,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          status: property.status,
        }}
        neighborhoods={neighborhoods ?? []}
        owners={owners ?? []}
        initialImages={images ?? []}
      />
    </div>
  );
}
