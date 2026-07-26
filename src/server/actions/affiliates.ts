"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const affiliateSchema = z.object({
  fullName: z.string().min(3).max(120),
  referralCode: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[A-Za-z0-9_-]+$/, "Solo letras, números, guiones y guión bajo"),
  commissionPercent: z.number().min(0).max(100),
});

/**
 * RLS (`affiliates_admin_only`) ya restringe esta tabla a super_admin — si
 * el caller no lo es, el insert falla silenciosamente (0 filas) y devolvemos
 * error acá para dar feedback claro.
 */
export async function createAffiliate(input: z.infer<typeof affiliateSchema>) {
  const parsed = affiliateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("affiliates").insert({
    full_name: parsed.data.fullName,
    referral_code: parsed.data.referralCode.toUpperCase(),
    commission_percent: parsed.data.commissionPercent,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}

export async function toggleAffiliateActive(affiliateId: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("affiliates")
    .update({ active })
    .eq("id", affiliateId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
