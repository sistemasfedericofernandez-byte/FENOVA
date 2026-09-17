import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import { AgencyProfileForm } from "@/components/dashboard/agency-profile-form";

export default async function PerfilPage() {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { data: agency } = await supabase
    .from("agencies")
    .select("business_name, cuit, city, whatsapp_number, logo_url, verification_status")
    .eq("id", agencyId)
    .single();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold">Perfil de la inmobiliaria</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Estos datos se usan en tus publicaciones y en tu marca dentro de
          PropiMarket.
        </p>
      </div>
      <AgencyProfileForm
        initial={{
          businessName: agency?.business_name ?? "",
          cuit: agency?.cuit ?? "",
          city: agency?.city ?? "",
          whatsappNumber: agency?.whatsapp_number ?? "",
          logoUrl: agency?.logo_url ?? "",
        }}
        verificationStatus={agency?.verification_status ?? "no_iniciado"}
      />
    </div>
  );
}
