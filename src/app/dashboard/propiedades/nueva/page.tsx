import { NewPropertyForm } from "@/components/dashboard/new-property-form";
import { createClient } from "@/lib/supabase/server";

export default async function NuevaPropiedadPage() {
  const supabase = await createClient();
  const { data: neighborhoods } = await supabase
    .from("neighborhoods")
    .select("id, name")
    .eq("active", true)
    .order("name");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Nueva propiedad</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Completá los datos y guardá como borrador o publicá directamente.
      </p>
      <NewPropertyForm neighborhoods={neighborhoods ?? []} />
    </div>
  );
}
