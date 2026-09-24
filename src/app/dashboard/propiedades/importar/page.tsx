import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { FacebookBulkImport } from "@/components/dashboard/facebook-bulk-import";

export default async function ImportarDesdeFacebookPage() {
  const supabase = await createClient();
  const { data: neighborhoods } = await supabase
    .from("neighborhoods")
    .select("id, name")
    .eq("active", true)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Importar desde Facebook"
        description="Traé tus propiedades de Marketplace en un minuto. Se cargan como borrador con sus fotos, precio y descripción, y las revisás antes de publicar."
      />
      <FacebookBulkImport neighborhoods={neighborhoods ?? []} />
    </div>
  );
}
