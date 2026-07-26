import { createClient } from "@/lib/supabase/server";
import { VerificationReviewItem } from "@/components/admin/verification-review-item";

export default async function VerificacionesAdminPage() {
  const supabase = await createClient();
  const { data: pending } = await supabase
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
