import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
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
        <PageHeader title="Propietarios" description={"Tu registro privado de los dueños de los inmuebles que gestionás. No es público — solo lo ves vos."} />
      </div>
      <OwnersManager owners={owners ?? []} />
    </div>
  );
}
