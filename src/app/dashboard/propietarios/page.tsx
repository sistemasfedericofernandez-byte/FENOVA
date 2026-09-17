import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import { OwnersManager } from "@/components/dashboard/owners-manager";

export default async function PropietariosPage() {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { data: owners } = await supabase
    .from("owners")
    .select("id, full_name, dni_cuit, phone, email, notes")
    .eq("agency_id", agencyId)
    .order("full_name");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold">Propietarios</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Tu registro privado de los dueños de los inmuebles que gestionás.
          No es público — solo lo ves vos.
        </p>
      </div>
      <OwnersManager owners={owners ?? []} />
    </div>
  );
}
