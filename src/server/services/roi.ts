import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Recalcula el ROI estimado por barrio a partir de datos propios (precio de
 * venta vs. alquiler de propiedades publicadas). Compartido entre el cron
 * (`/api/cron/roi-snapshot`) y el botón "Recalcular ahora" del backoffice.
 */
export async function recalculateNeighborhoodRoi(): Promise<{ updated: number }> {
  const supabase = createAdminClient();

  const { data: neighborhoods } = await supabase
    .from("neighborhoods")
    .select("id")
    .eq("active", true);

  if (!neighborhoods?.length) {
    return { updated: 0 };
  }

  let updated = 0;

  for (const neighborhood of neighborhoods) {
    const { data: saleProps } = await supabase
      .from("properties")
      .select("price_amount, surface_total_m2")
      .eq("neighborhood_id", neighborhood.id)
      .eq("operation_type", "venta")
      .eq("status", "publicada")
      .eq("price_currency", "ARS");

    const { data: rentProps } = await supabase
      .from("properties")
      .select("price_amount")
      .eq("neighborhood_id", neighborhood.id)
      .eq("operation_type", "alquiler")
      .eq("status", "publicada")
      .eq("price_currency", "ARS");

    const saleWithSurface = (saleProps ?? []).filter(
      (p) => p.surface_total_m2 && p.surface_total_m2 > 0,
    );
    const avgSalePriceM2 = saleWithSurface.length
      ? saleWithSurface.reduce(
          (acc, p) => acc + p.price_amount / p.surface_total_m2!,
          0,
        ) / saleWithSurface.length
      : null;

    const avgRentPrice = rentProps?.length
      ? rentProps.reduce((acc, p) => acc + p.price_amount, 0) / rentProps.length
      : null;

    const avgSalePrice = saleProps?.length
      ? saleProps.reduce((acc, p) => acc + p.price_amount, 0) / saleProps.length
      : null;

    const estimatedRoiPercent =
      avgRentPrice && avgSalePrice
        ? ((avgRentPrice * 12) / avgSalePrice) * 100
        : null;

    await supabase.from("neighborhood_roi_snapshot").insert({
      neighborhood_id: neighborhood.id,
      avg_sale_price_m2: avgSalePriceM2,
      avg_rent_price: avgRentPrice,
      estimated_roi_percent: estimatedRoiPercent,
      sample_size_sale: saleProps?.length ?? 0,
      sample_size_rent: rentProps?.length ?? 0,
      calculated_at: new Date().toISOString(),
    });

    updated += 1;
  }

  return { updated };
}
