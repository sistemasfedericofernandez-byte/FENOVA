"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const searchAlertSchema = z.object({
  email: z.string().email(),
  operationType: z.enum(["venta", "alquiler", "alquiler_temporal"]).optional(),
  propertyType: z
    .enum([
      "casa",
      "departamento",
      "terreno",
      "local",
      "oficina",
      "galpon",
      "quinta",
      "otro",
    ])
    .optional(),
  neighborhoodId: z.string().uuid().optional(),
  priceMax: z.number().positive().optional(),
  rawQueryText: z.string().max(280).optional(),
});

export async function createSearchAlert(input: z.infer<typeof searchAlertSchema>) {
  const parsed = searchAlertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("search_alerts").insert({
    email: parsed.data.email,
    operation_type: parsed.data.operationType,
    property_type: parsed.data.propertyType,
    neighborhood_id: parsed.data.neighborhoodId,
    price_max: parsed.data.priceMax,
    raw_query_text: parsed.data.rawQueryText,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}
