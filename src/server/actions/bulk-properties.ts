"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId, slugify } from "@/server/services/agency";
import { getAgencyPlanCapacity } from "@/server/services/subscriptions";
import { notifyMatchingAlerts } from "@/server/services/alerts";

const bulkRowSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(4000).optional(),
  operationType: z.enum(["venta", "alquiler", "alquiler_temporal"]),
  propertyType: z.enum([
    "casa",
    "departamento",
    "terreno",
    "local",
    "oficina",
    "galpon",
    "quinta",
    "otro",
  ]),
  neighborhoodName: z.string().optional(),
  priceAmount: z.number().positive(),
  priceCurrency: z.enum(["ARS", "USD"]),
  surfaceTotalM2: z.number().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  wantsPublished: z.boolean().default(false),
});

export type BulkRowInput = z.infer<typeof bulkRowSchema>;

export type BulkRowResult = {
  row: number;
  title: string;
  ok: boolean;
  status?: "borrador" | "publicada";
  error?: string;
};

export async function bulkCreateProperties(rows: BulkRowInput[]) {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const capacity = await getAgencyPlanCapacity(supabase, agencyId);
  if (!capacity.hasActivePlan) {
    return { ok: false as const, error: "No hay una suscripción activa." };
  }
  if (!capacity.allowsCsvBulkUpload) {
    return {
      ok: false as const,
      error: "Tu plan actual no incluye carga masiva por CSV/Excel.",
    };
  }

  const { data: neighborhoods } = await supabase
    .from("neighborhoods")
    .select("id, name");
  const neighborhoodMap = new Map(
    (neighborhoods ?? []).map((n) => [n.name.trim().toLowerCase(), n.id]),
  );

  let remainingCapacity = capacity.remainingActiveListings;
  const results: BulkRowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 2; // +1 por índice base 1, +1 por la fila de encabezado
    const parsed = bulkRowSchema.safeParse(rows[i]);

    if (!parsed.success) {
      results.push({
        row: rowNumber,
        title: rows[i]?.title ?? "(sin título)",
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Datos inválidos",
      });
      continue;
    }

    const willPublish = parsed.data.wantsPublished && remainingCapacity > 0;
    if (parsed.data.wantsPublished && !willPublish) {
      remainingCapacity = 0;
    } else if (willPublish) {
      remainingCapacity -= 1;
    }

    const status = willPublish ? "publicada" : "borrador";
    const neighborhoodId = parsed.data.neighborhoodName
      ? neighborhoodMap.get(parsed.data.neighborhoodName.trim().toLowerCase())
      : undefined;

    const slug = slugify(parsed.data.title);
    const { data: inserted, error } = await supabase
      .from("properties")
      .insert({
        agency_id: agencyId,
        title: parsed.data.title,
        slug,
        description: parsed.data.description,
        operation_type: parsed.data.operationType,
        property_type: parsed.data.propertyType,
        neighborhood_id: neighborhoodId,
        price_amount: parsed.data.priceAmount,
        price_currency: parsed.data.priceCurrency,
        surface_total_m2: parsed.data.surfaceTotalM2,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        status,
        published_at: status === "publicada" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (error) {
      results.push({
        row: rowNumber,
        title: parsed.data.title,
        ok: false,
        error: error.message,
      });
      continue;
    }

    if (status === "publicada") {
      await notifyMatchingAlerts({
        id: inserted.id,
        slug,
        title: parsed.data.title,
        operationType: parsed.data.operationType,
        propertyType: parsed.data.propertyType,
        neighborhoodId,
        priceAmount: parsed.data.priceAmount,
        priceCurrency: parsed.data.priceCurrency,
      });
    }

    results.push({
      row: rowNumber,
      title: parsed.data.title,
      ok: true,
      status,
    });
  }

  const successRows = results.filter((r) => r.ok).length;
  const errorRows = results.length - successRows;

  await supabase.from("bulk_upload_jobs").insert({
    agency_id: agencyId,
    file_url: "client-upload",
    status: errorRows === 0 ? "completado" : "completado_con_errores",
    total_rows: results.length,
    success_rows: successRows,
    error_rows: errorRows,
    error_log: results.filter((r) => !r.ok),
  });

  return { ok: true as const, results };
}
