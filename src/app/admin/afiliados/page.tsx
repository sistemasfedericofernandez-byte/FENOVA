import { createClient } from "@/lib/supabase/server";
import { NewAffiliateForm } from "@/components/admin/new-affiliate-form";

export default async function AfiliadosAdminPage() {
  const supabase = await createClient();
  const { data: affiliates } = await supabase
    .from("affiliates")
    .select("id, full_name, referral_code, commission_percent, active")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Vendedores / Afiliados</h1>
      <p className="text-zinc-400">
        Gestión de códigos de referido y comisiones.
      </p>

      <NewAffiliateForm />

      {!affiliates?.length ? (
        <p className="text-zinc-400">Todavía no hay afiliados cargados.</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {affiliates.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-4">
              <div className="flex flex-col">
                <span className="font-medium">{a.full_name}</span>
                <span className="text-sm text-zinc-500">
                  Código: {a.referral_code} · Comisión: {a.commission_percent}%
                </span>
              </div>
              <span
                className={
                  a.active ? "text-emerald-500 text-sm" : "text-zinc-500 text-sm"
                }
              >
                {a.active ? "Activo" : "Inactivo"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
