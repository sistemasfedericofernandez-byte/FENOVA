import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { TenantLookup } from "@/components/dashboard/tenant-lookup";

export default async function InquilinosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const { data: agency } = await supabase
    .from("agencies")
    .select("verification_status")
    .eq("profile_id", user?.id ?? "")
    .maybeSingle();

  const canAccess =
    profile?.role === "inmobiliaria" && agency?.verification_status === "aprobado";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Calificación de inquilinos" description={"Buscador de antecedentes por DNI. Disponible solo para inmobiliarias validadas."} />

      {canAccess ? (
        <TenantLookup />
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Este módulo está disponible solo para inmobiliarias con la
          verificación &ldquo;Propietario Seguro&rdquo; aprobada. Solicitala desde{" "}
          <a href="/dashboard/verificacion" className="underline underline-offset-4">
            Propietario Seguro
          </a>
          .
        </div>
      )}
    </div>
  );
}
