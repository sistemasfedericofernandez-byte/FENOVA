"use server";

import { createClient } from "@/lib/supabase/server";
import { recalculateNeighborhoodRoi } from "@/server/services/roi";

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    throw new Error("Solo super_admin puede ejecutar esta acción");
  }
}

export async function recalculateRoiNow() {
  try {
    await requireSuperAdmin();
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "No autorizado",
    };
  }

  const result = await recalculateNeighborhoodRoi();
  return { ok: true as const, updated: result.updated };
}
