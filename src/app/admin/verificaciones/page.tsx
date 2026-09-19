import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VerificationReviewItem } from "@/components/admin/verification-review-item";

export default async function VerificacionesAdminPage() {
  // El comprobante (verification_doc_url) no es legible con la API pública;
  // se lee con el cliente de servicio, previa confirmación explícita del rol.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle();
  if (profile?.role !== "super_admin") return null;

  const { data: pending } = await createAdminClient()
    .from("agencies")
    .select("id, business_name, verification_doc_url")
    .eq("verification_status", "pendiente")
    .order("updated_at", { ascending: true });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Verificaciones pendientes</h1>
      <p className="text-zinc-400">
        Aprobación/rechazo de solicitudes de Propietario Seguro.
      </p>

      {!pending?.length ? (
        <p className="text-zinc-400">No hay solicitudes pendientes.</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {pending.map((agency) => (
            <VerificationReviewItem
              key={agency.id}
              agencyId={agency.id}
              businessName={agency.business_name}
              docUrl={agency.verification_doc_url}
            />
          ))}
        </div>
      )}
    </div>
  );
}
