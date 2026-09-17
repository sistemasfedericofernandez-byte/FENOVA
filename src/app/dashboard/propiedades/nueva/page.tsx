import { NewPropertyForm } from "@/components/dashboard/new-property-form";
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
      <h1 className="text-2xl font-semibold">Nueva propiedad</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Completá los datos y guardá como borrador o publicá directamente.
      </p>
      <NewPropertyForm neighborhoods={neighborhoods ?? []} owners={owners ?? []} />
    </div>
  );
}
