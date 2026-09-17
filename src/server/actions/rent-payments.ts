"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import type { PriceCurrency } from "@/types/database.types";

function firstOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

/**
 * Genera (si faltan) las filas de pago pendientes de un contrato activo,
 * desde el último período ya generado (o `start_date`) hasta el mes
 * actual — así una agencia que no visita la página hace meses ve todos los
 * pendientes, no solo el de hoy. El `unique(tenancy_id, period_month)` de
 * la tabla hace que este insert sea seguro aunque se llame más de una vez.
 */
export async function ensureCurrentMonthPaymentRow(tenancyId: string) {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { data: tenancy } = await supabase
    .from("property_tenancies")
    .select("id, status, monthly_rent_amount, price_currency, start_date")
    .eq("id", tenancyId)
    .eq("agency_id", agencyId)
    .eq("status", "activo")
    .maybeSingle();

  if (!tenancy) return { ok: false as const, error: "No hay un contrato activo." };

  const currentMonth = firstOfMonth(new Date());

  const { data: lastPayment } = await supabase
    .from("rent_payments")
    .select("period_month")
    .eq("tenancy_id", tenancyId)
    .order("period_month", { ascending: false })
    .limit(1)
    .maybeSingle();

  let cursor = lastPayment
    ? addMonths(new Date(lastPayment.period_month), 1)
    : firstOfMonth(new Date(tenancy.start_date ?? new Date().toISOString()));

  const rowsToInsert: {
    tenancy_id: string;
    agency_id: string;
    period_month: string;
    amount: number | null;
    price_currency: PriceCurrency | null;
  }[] = [];

  while (cursor.getTime() <= currentMonth.getTime() && rowsToInsert.length < 24) {
    rowsToInsert.push({
      tenancy_id: tenancyId,
      agency_id: agencyId,
      period_month: toDateString(cursor),
      amount: tenancy.monthly_rent_amount,
      price_currency: tenancy.price_currency,
    });
    cursor = addMonths(cursor, 1);
  }

  if (!rowsToInsert.length) return { ok: true as const };

  const { error } = await supabase
    .from("rent_payments")
    .upsert(rowsToInsert, { onConflict: "tenancy_id,period_month", ignoreDuplicates: true });

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function markPaymentAsPaid(paymentId: string, paidAt?: string) {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { error } = await supabase
    .from("rent_payments")
    .update({ status: "pagado", paid_at: paidAt ?? new Date().toISOString() })
    .eq("id", paymentId)
    .eq("agency_id", agencyId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function markPaymentAsPending(paymentId: string) {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { error } = await supabase
    .from("rent_payments")
    .update({ status: "pendiente", paid_at: null })
    .eq("id", paymentId)
    .eq("agency_id", agencyId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
