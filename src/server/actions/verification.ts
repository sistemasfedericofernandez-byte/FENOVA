"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * La agencia sube su comprobante/DNI y queda en estado "pendiente" hasta
 * que un super_admin la apruebe o rechace desde /admin/verificaciones.
 * RLS (`agencies_update_own_or_admin`) ya permite que la agencia actualice
 * su propia fila, no hace falta el cliente admin acá.
 */
export async function submitVerificationRequest(docUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "No autenticado" };

  const { error } = await supabase
    .from("agencies")
    .update({
      verification_doc_url: docUrl,
      verification_status: "pendiente",
    })
    .eq("profile_id", user.id);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

/**
 * Aprueba o rechaza una solicitud de verificación. Solo un super_admin
 * puede ejecutar esto: RLS bloquea el update si el caller no lo es.
 */
export async function reviewVerificationRequest(
  agencyId: string,
  decision: "aprobado" | "rechazado",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "No autenticado" };

  const { error } = await supabase
    .from("agencies")
    .update({
      verification_status: decision,
      is_verified_owner: decision === "aprobado",
      verified_at: decision === "aprobado" ? new Date().toISOString() : null,
    })
    .eq("id", agencyId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
