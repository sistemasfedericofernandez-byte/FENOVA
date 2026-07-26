import { createClient } from "@/lib/supabase/server";
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
      <h1 className="text-2xl font-semibold">Propietario Seguro</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Subí tu DNI o comprobante de titularidad para obtener el sello de
        verificación en tus publicaciones.
      </p>
      <VerificationForm initialStatus={agency?.verification_status ?? "no_iniciado"} />
    </div>
  );
}
