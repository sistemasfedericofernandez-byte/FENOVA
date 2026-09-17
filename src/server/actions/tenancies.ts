"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import { encryptField } from "@/lib/encryption";

const markAsRentedSchema = z.object({
  tenantFullName: z.string().min(2).max(160),
  tenantDni: z.string().max(20).optional(),
  guarantorFullName: z.string().max(160).optional(),
  guarantorDni: z.string().max(20).optional(),
  monthlyRentAmount: z.number().positive().optional(),
  priceCurrency: z.enum(["ARS", "USD"]).optional(),
  startDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
  dataConsentConfirmed: z.boolean().refine((value) => value === true, {
    message: "Tenés que confirmar que contás con el consentimiento del inquilino/garante.",
  }),
});

/**
 * Marca una propiedad como alquilada: la saca del sitio público (cambia su
 * `status` a "alquilada", así ya no aparece en `properties_select_public`)
 * y crea el registro privado del contrato — inquilino, garante y DNIs,
 * visibles solo para la agencia dueña (RLS de `property_tenancies`).
 */
export async function markPropertyAsRented(
  propertyId: string,
  input: z.infer<typeof markAsRentedSchema>,
) {
  const parsed = markAsRentedSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("agency_id", agencyId)
    .maybeSingle();

  if (!property) {
    return { ok: false as const, error: "No se encontró la propiedad." };
  }

  const { error: tenancyError } = await supabase.from("property_tenancies").insert({
    property_id: propertyId,
    agency_id: agencyId,
    status: "activo",
    tenant_full_name: parsed.data.tenantFullName,
    tenant_dni: parsed.data.tenantDni ? encryptField(parsed.data.tenantDni) : undefined,
    guarantor_full_name: parsed.data.guarantorFullName,
    guarantor_dni: parsed.data.guarantorDni ? encryptField(parsed.data.guarantorDni) : undefined,
    monthly_rent_amount: parsed.data.monthlyRentAmount,
    price_currency: parsed.data.priceCurrency,
    start_date: parsed.data.startDate || new Date().toISOString().slice(0, 10),
    notes: parsed.data.notes,
    data_consent_confirmed_at: new Date().toISOString(),
  });

  if (tenancyError) {
    return { ok: false as const, error: tenancyError.message };
  }

  const { error: propertyError } = await supabase
    .from("properties")
    .update({ status: "alquilada", published_at: null })
    .eq("id", propertyId)
    .eq("agency_id", agencyId);

  if (propertyError) {
    return { ok: false as const, error: propertyError.message };
  }

  return { ok: true as const };
}

/**
 * Termina el contrato activo de una propiedad: la vuelve a "borrador"
 * (la agencia revisa/actualiza antes de republicarla, no se republica
 * sola) y marca el registro de alquiler como finalizado — queda en el
 * historial, no se borra.
 */
export async function endTenancy(propertyId: string) {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { data: tenancy } = await supabase
    .from("property_tenancies")
    .select("id")
    .eq("property_id", propertyId)
    .eq("agency_id", agencyId)
    .eq("status", "activo")
    .maybeSingle();

  if (!tenancy) {
    return { ok: false as const, error: "No hay un contrato activo para esta propiedad." };
  }

  const { error: tenancyError } = await supabase
    .from("property_tenancies")
    .update({ status: "finalizado", end_date: new Date().toISOString().slice(0, 10) })
    .eq("id", tenancy.id);

  if (tenancyError) {
    return { ok: false as const, error: tenancyError.message };
  }

  const { error: propertyError } = await supabase
    .from("properties")
    .update({ status: "borrador" })
    .eq("id", propertyId)
    .eq("agency_id", agencyId);

  if (propertyError) {
    return { ok: false as const, error: propertyError.message };
  }

  return { ok: true as const, tenancyId: tenancy.id };
}

/**
 * Borra los datos personales identificatorios (nombre, DNI) de un contrato
 * ya finalizado, a pedido de la inmobiliaria — reduce cuánto dato sensible
 * de terceros queda guardado indefinidamente. Solo se permite sobre
 * contratos "finalizado" (nunca sobre uno activo), y se deja la marca de
 * cuándo se hizo. El resto del registro (fechas, monto, moneda) se
 * conserva como historial propio de la agencia.
 */
export async function eraseTenancyPersonalData(tenancyId: string) {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { data: tenancy } = await supabase
    .from("property_tenancies")
    .select("id, status")
    .eq("id", tenancyId)
    .eq("agency_id", agencyId)
    .maybeSingle();

  if (!tenancy) return { ok: false as const, error: "No se encontró el contrato." };
  if (tenancy.status !== "finalizado") {
    return { ok: false as const, error: "Solo se pueden borrar los datos de un contrato finalizado." };
  }

  const { error } = await supabase
    .from("property_tenancies")
    .update({
      tenant_full_name: "Datos eliminados a pedido de la inmobiliaria",
      tenant_dni: null,
      guarantor_full_name: null,
      guarantor_dni: null,
      notes: null,
      personal_data_erased_at: new Date().toISOString(),
    })
    .eq("id", tenancyId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
