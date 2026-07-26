import { createClient } from "@/lib/supabase/server";
import { RecalculateRoiButton } from "@/components/admin/recalculate-roi-button";
import { formatArs } from "@/lib/utils";

export default async function RoiAdminPage() {
  const supabase = await createClient();

  type Snapshot = {
    neighborhood_id: string;
    avg_sale_price_m2: number | null;
    avg_rent_price: number | null;
    estimated_roi_percent: number | null;
    sample_size_sale: number;
    sample_size_rent: number;
    calculated_at: string;
  };

  const { data: snapshots } = await supabase
    .from("neighborhood_roi_snapshot")
    .select(
      "neighborhood_id, avg_sale_price_m2, avg_rent_price, estimated_roi_percent, sample_size_sale, sample_size_rent, calculated_at",
    )
    .order("calculated_at", { ascending: false })
    .returns<Snapshot[]>();

  const { data: neighborhoods } = await supabase
    .from("neighborhoods")
    .select("id, name");
  const neighborhoodMap = new Map((neighborhoods ?? []).map((n) => [n.id, n.name]));

  const latestByNeighborhood = new Map<string, Snapshot>();
  for (const snap of snapshots ?? []) {
    if (!latestByNeighborhood.has(snap.neighborhood_id)) {
      latestByNeighborhood.set(snap.neighborhood_id, snap);
    }
  }
  const rows = [...latestByNeighborhood.values()];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Tablero de Inteligencia Inversora</h1>
      <p className="text-zinc-400">
        ROI estimado por barrio, calculado con datos propios de venta y
        alquiler (solo propiedades publicadas en ARS).
      </p>

      <RecalculateRoiButton />

      {!rows.length ? (
        <p className="text-zinc-400">
          Todavía no hay snapshots calculados. Presioná &quot;Recalcular
          ahora&quot;.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="p-3">Barrio</th>
                <th className="p-3">Precio venta / m²</th>
                <th className="p-3">Alquiler promedio</th>
                <th className="p-3">ROI anual estimado</th>
                <th className="p-3">Muestra (venta / alquiler)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((snap) => (
                <tr key={snap.neighborhood_id} className="border-b border-zinc-900">
                  <td className="p-3">
                    {neighborhoodMap.get(snap.neighborhood_id) ?? "—"}
                  </td>
                  <td className="p-3">
                    {snap.avg_sale_price_m2
                      ? formatArs(snap.avg_sale_price_m2, "ARS")
                      : "—"}
                  </td>
                  <td className="p-3">
                    {snap.avg_rent_price ? formatArs(snap.avg_rent_price, "ARS") : "—"}
                  </td>
                  <td className="p-3">
                    {snap.estimated_roi_percent
                      ? `${snap.estimated_roi_percent.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="p-3">
                    {snap.sample_size_sale} / {snap.sample_size_rent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
