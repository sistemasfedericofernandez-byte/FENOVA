"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";

const ownerSchema = z.object({
  fullName: z.string().min(2).max(160),
  dniCuit: z.string().max(20).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().max(160).optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

export async function createOwner(input: z.infer<typeof ownerSchema>) {
  const parsed = ownerSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { data, error } = await supabase
    .from("owners")
    .insert({
      agency_id: agencyId,
      full_name: parsed.data.fullName,
      dni_cuit: parsed.data.dniCuit,
      phone: parsed.data.phone,
      email: parsed.data.email || undefined,
      notes: parsed.data.notes,
    })
    .select("id, full_name, dni_cuit, phone, email, notes")
    .single();

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, owner: data };
}

export async function updateOwner(
  ownerId: string,
  input: z.infer<typeof ownerSchema>,
) {
  const parsed = ownerSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten() };

  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { error } = await supabase
    .from("owners")
    .update({
      full_name: parsed.data.fullName,
      dni_cuit: parsed.data.dniCuit,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      notes: parsed.data.notes,
    })
    .eq("id", ownerId)
    .eq("agency_id", agencyId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function deleteOwner(ownerId: string) {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { error } = await supabase
    .from("owners")
    .delete()
    .eq("id", ownerId)
    .eq("agency_id", agencyId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
