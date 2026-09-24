import { NewPropertyForm } from "@/components/dashboard/new-property-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";

export default async function NuevaPropiedadPage() {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const [{ data: neighborhoods }, { data: owners }] = await Promise.all([
    supabase.from("neighborhoods").select("id, name").eq("active", true).order("name"),
    supabase.from("owners").select("id, full_name").eq("agency_id", agencyId).order("full_name"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Nueva propiedad" description={"Completá los datos y guardá como borrador o publicá directamente."} />
      <NewPropertyForm neighborhoods={neighborhoods ?? []} owners={owners ?? []} />
    </div>
  );
}
