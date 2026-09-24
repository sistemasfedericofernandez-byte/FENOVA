import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import { PageHeader, StatusBadge } from "@/components/dashboard/page-header";

const STATUS: Record<string, { label: string; tone: "green" | "gray" | "amber" | "red" | "blue" }> = {
  publicada: { label: "Publicada", tone: "green" },
  borrador: { label: "Borrador", tone: "gray" },
  oculta: { label: "Oculta", tone: "amber" },
  pausada_por_impago: { label: "Pausada por impago", tone: "red" },
  alquilada: { label: "Alquilada", tone: "blue" },
};

export default async function EstadisticasPage() {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, status, views_count, whatsapp_clicks_count")
    .eq("agency_id", agencyId)
    .order("views_count", { ascending: false });

  const totalViews = (properties ?? []).reduce((acc, p) => acc + p.views_count, 0);
  const totalClicks = (properties ?? []).reduce((acc, p) => acc + p.whatsapp_clicks_count, 0);
  const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";

  const cards = [
    { value: totalViews, label: "Veces que vieron tus avisos" },
    { value: totalClicks, label: "Consultas por WhatsApp" },
    { value: `${conversionRate}%`, label: "De las visitas terminan en consulta" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Estadísticas"
        description="Cuánta gente ve tus propiedades y cuántas personas te escriben."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card flex flex-col gap-1 p-5">
            <span className="text-3xl font-bold tracking-tight text-[#0d2740]">{card.value}</span>
            <span className="text-sm font-medium text-zinc-700">{card.label}</span>
          </div>
        ))}
      </div>

      {!properties?.length ? (
        <div className="card p-8 text-center text-[15px] text-zinc-700">
          Todavía no tenés propiedades cargadas. Cuando publiques, acá vas a ver cómo les va.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-800">
                <th className="p-3 font-semibold">Propiedad</th>
                <th className="p-3 font-semibold">Estado</th>
                <th className="p-3 text-right font-semibold">Vistas</th>
                <th className="p-3 text-right font-semibold">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const status = STATUS[p.status] ?? { label: p.status, tone: "gray" as const };
                return (
                  <tr key={p.id} className="border-b border-zinc-100 last:border-0">
                    <td className="p-3 font-medium text-zinc-900">{p.title}</td>
                    <td className="p-3">
                      <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                    </td>
                    <td className="p-3 text-right tabular-nums text-zinc-900">{p.views_count}</td>
                    <td className="p-3 text-right tabular-nums text-zinc-900">
                      {p.whatsapp_clicks_count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
