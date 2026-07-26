import { createClient } from "@/lib/supabase/server";

export default async function EstadisticasPage() {
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
        .select("id, title, status, views_count, whatsapp_clicks_count")
        .eq("agency_id", agency.id)
        .order("views_count", { ascending: false })
    : { data: [] };

  const totalViews = (properties ?? []).reduce((acc, p) => acc + p.views_count, 0);
  const totalClicks = (properties ?? []).reduce(
    (acc, p) => acc + p.whatsapp_clicks_count,
    0,
  );
  const conversionRate =
    totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Estadísticas</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Visualizaciones y clics en WhatsApp por propiedad.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-2xl font-bold">{totalViews}</p>
          <p className="text-sm text-zinc-500">Vistas totales</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-2xl font-bold">{totalClicks}</p>
          <p className="text-sm text-zinc-500">Clics en WhatsApp</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-2xl font-bold">{conversionRate}%</p>
          <p className="text-sm text-zinc-500">Tasa de conversión</p>
        </div>
      </div>

      {!properties?.length ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Todavía no tenés propiedades cargadas.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                <th className="p-3">Propiedad</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Vistas</th>
                <th className="p-3">Clics WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-900">
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3">{p.views_count}</td>
                  <td className="p-3">{p.whatsapp_clicks_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
