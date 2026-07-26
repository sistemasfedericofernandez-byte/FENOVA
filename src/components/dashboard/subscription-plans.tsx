"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startSubscriptionCheckout } from "@/server/actions/subscriptions";
import { formatArs } from "@/lib/utils";

type Plan = {
  id: string;
  slug: string;
  name: string;
  price_ars: number;
  max_active_listings: number;
  allows_csv_bulk_upload: boolean;
  allows_advanced_stats: boolean;
};

export function SubscriptionPlans({
  plans,
  currentPlanId,
}: {
  plans: Plan[];
  currentPlanId: string | null;
}) {
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(slug: string) {
    setError(null);
    setLoadingSlug(slug);

    const result = await startSubscriptionCheckout(slug);

    if (!result.ok) {
      setError(
        typeof result.error === "string"
          ? result.error
          : "No se pudo iniciar el pago",
      );
      setLoadingSlug(null);
      return;
    }

    window.location.assign(result.checkoutUrl);
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          return (
            <div
              key={plan.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-2xl font-bold">
                {formatArs(plan.price_ars, "ARS")}
                <span className="text-sm font-normal text-zinc-500">/mes</span>
              </p>
              <ul className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>Hasta {plan.max_active_listings} publicaciones activas</li>
                <li>
                  {plan.allows_csv_bulk_upload
                    ? "Carga masiva por CSV/Excel"
                    : "Carga manual"}
                </li>
                <li>
                  {plan.allows_advanced_stats
                    ? "Estadísticas avanzadas"
                    : "Estadísticas básicas"}
                </li>
              </ul>
              <Button
                disabled={isCurrent || loadingSlug === plan.slug}
                onClick={() => handleSubscribe(plan.slug)}
              >
                {isCurrent
                  ? "Plan actual"
                  : loadingSlug === plan.slug
                    ? "Redirigiendo..."
                    : "Suscribirme"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
