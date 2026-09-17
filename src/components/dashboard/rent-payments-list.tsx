"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markPaymentAsPaid, markPaymentAsPending } from "@/server/actions/rent-payments";
import { formatArs } from "@/lib/utils";
import type { PriceCurrency, RentPaymentStatus } from "@/types/database.types";

type Payment = {
  id: string;
  period_month: string;
  amount: number | null;
  price_currency: PriceCurrency | null;
  status: RentPaymentStatus;
  paid_at: string | null;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatPeriod(periodMonth: string) {
  const label = MONTH_FORMATTER.format(new Date(`${periodMonth}T00:00:00Z`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function RentPaymentsList({ payments }: { payments: Payment[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(payment: Payment) {
    setLoadingId(payment.id);
    setError(null);
    const result =
      payment.status === "pendiente"
        ? await markPaymentAsPaid(payment.id)
        : await markPaymentAsPending(payment.id);
    setLoadingId(null);

    if (!result.ok) {
      setError(typeof result.error === "string" ? result.error : "No se pudo actualizar el pago");
      return;
    }
    router.refresh();
  }

  if (!payments.length) {
    return <p className="text-zinc-600 dark:text-zinc-400">Todavía no hay meses registrados.</p>;
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col">
              <span className="font-medium">{formatPeriod(payment.period_month)}</span>
              <span className="text-sm text-zinc-500">
                {payment.amount != null
                  ? formatArs(payment.amount, payment.price_currency ?? "ARS")
                  : "Sin monto"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={
                  payment.status === "pagado"
                    ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                }
              >
                {payment.status === "pagado" ? "Pagado" : "Pendiente"}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={loadingId === payment.id}
                onClick={() => handleToggle(payment)}
              >
                {payment.status === "pendiente" ? "Marcar pagado" : "Marcar pendiente"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
