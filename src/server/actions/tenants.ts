"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const dniSchema = z.string().regex(/^\d{7,8}$/, "DNI inválido");

/**
 * Consulta el historial de un inquilino por DNI. Delegado a la función SQL
 * `lookup_tenant_by_dni` (SECURITY DEFINER) que valida el rol/estado de la
 * agencia y escribe el registro de auditoría de forma atómica — nunca se
 * lee la tabla `tenants_registry` directo desde el cliente.
 */
export async function lookupTenantByDni(dni: string) {
  const parsed = dniSchema.safeParse(dni);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lookup_tenant_by_dni", {
    p_dni: parsed.data,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, ratings: data };
}

const ratingSchema = z.object({
  dni: dniSchema,
  fullName: z.string().max(120).optional(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

/**
 * Registra una calificación de inquilino. Delegado a `rate_tenant_by_dni`
 * (SECURITY DEFINER) que crea el registro del inquilino si no existe y
 * valida que quien califica sea una inmobiliaria validada.
 */
export async function rateTenant(input: z.infer<typeof ratingSchema>) {
  const parsed = ratingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("rate_tenant_by_dni", {
    p_dni: parsed.data.dni,
    p_full_name: parsed.data.fullName ?? null,
    p_score: parsed.data.score,
    p_comment: parsed.data.comment ?? null,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}
