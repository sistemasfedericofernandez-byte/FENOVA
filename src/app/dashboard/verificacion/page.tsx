import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { VerificationForm } from "@/components/dashboard/verification-form";

export default async function VerificacionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: agency } = await supabase
    .from("agencies")
    .select("verification_status")
    .eq("profile_id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Propietario Seguro" description={"Subí tu DNI o comprobante de titularidad para obtener el sello de verificación en tus publicaciones."} />
      <VerificationForm initialStatus={agency?.verification_status ?? "no_iniciado"} />
    </div>
  );
}
