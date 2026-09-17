"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";

const agencyProfileSchema = z.object({
  businessName: z.string().min(2).max(160),
  cuit: z.string().max(20).optional(),
  city: z.string().min(2).max(120),
  whatsappNumber: z.string().max(40).optional(),
  logoUrl: z.string().url().optional(),
});

/**
 * Edita los datos de marca/contacto de la agencia. No toca
 * `verification_status`/`is_verified_owner`/`verified_at` — eso solo lo
 * cambia el flujo de /dashboard/verificacion, no este formulario.
 */
export async function updateAgencyProfile(input: z.infer<typeof agencyProfileSchema>) {
  const parsed = agencyProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { error } = await supabase
    .from("agencies")
    .update({
      business_name: parsed.data.businessName,
      cuit: parsed.data.cuit,
      city: parsed.data.city,
      whatsapp_number: parsed.data.whatsappNumber,
      logo_url: parsed.data.logoUrl,
    })
    .eq("id", agencyId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
