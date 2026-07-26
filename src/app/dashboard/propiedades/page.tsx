import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatArs } from "@/lib/utils";
import type { PriceCurrency } from "@/types/database.types";

const STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  oculta: "Oculta",
  pausada_por_impago: "Pausada por impago",
};

export default async function DashboardPropiedadesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("profile_id", user?.id ?? "")
    .maybeSingle();

  const { data: properties } = agency
    ? await supabase
        .from("properties")
        .select("id, title, slug, status, price_amount, price_currency, views_count, whatsapp_clicks_count")
        .eq("agency_id", agency.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis propiedades</h1>
        <Link
          href="/dashboard/propiedades/nueva"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
        >
          + Nueva propiedad
        </Link>
      </div>

      {!properties?.length ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Todavía no cargaste ninguna propiedad.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {properties.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col">
                <span className="font-medium">{p.title}</span>
                <span className="text-sm text-zinc-500">
                  {formatArs(p.price_amount, p.price_currency as PriceCurrency)} ·{" "}
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm text-zinc-500 sm:justify-end">
                <span>{p.views_count} vistas</span>
                <span>{p.whatsapp_clicks_count} clics WhatsApp</span>
                <Link
                  href={`/dashboard/propiedades/${p.id}/editar`}
                  className="flex min-h-11 items-center underline underline-offset-4"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
