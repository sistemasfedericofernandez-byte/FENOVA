"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  markPropertyAsRented,
  endTenancy,
  eraseTenancyPersonalData,
} from "@/server/actions/tenancies";
import { formatArs } from "@/lib/utils";
import type { PriceCurrency } from "@/types/database.types";

type ActiveTenancy = {
  id: string;
  tenantFullName: string;
  tenantDni: string | null;
  guarantorFullName: string | null;
  guarantorDni: string | null;
  monthlyRentAmount: number | null;
  priceCurrency: PriceCurrency | null;
  startDate: string | null;
  notes: string | null;
};

export function TenancyForm({
  propertyId,
  activeTenancy,
}: {
  propertyId: string;
  activeTenancy: ActiveTenancy | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tenantFullName, setTenantFullName] = useState("");
  const [tenantDni, setTenantDni] = useState("");
  const [guarantorFullName, setGuarantorFullName] = useState("");
  const [guarantorDni, setGuarantorDni] = useState("");
  const [monthlyRentAmount, setMonthlyRentAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState<PriceCurrency>("ARS");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [dataConsentConfirmed, setDataConsentConfirmed] = useState(false);

  async function handleMarkAsRented(e: SyntheticEvent) {
    e.preventDefault();
    setError(null);

    if (!dataConsentConfirmed) {
      setError(
        "Tenés que confirmar que contás con el consentimiento del inquilino/garante para registrar sus datos.",
      );
      return;
    }

    setLoading(true);

    const result = await markPropertyAsRented(propertyId, {
      tenantFullName,
      tenantDni: tenantDni || undefined,
      guarantorFullName: guarantorFullName || undefined,
      guarantorDni: guarantorDni || undefined,
      monthlyRentAmount: monthlyRentAmount ? Number(monthlyRentAmount) : undefined,
      priceCurrency,
      startDate: startDate || undefined,
      notes: notes || undefined,
      dataConsentConfirmed,
    });

    if (!result.ok) {
      setError(
        typeof result.error === "string" ? result.error : "Revisá los datos del formulario",
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard/propiedades");
    router.refresh();
  }

  async function handleEndTenancy() {
    if (!confirm("¿Finalizar el contrato? La propiedad vuelve a borrador y ya no se muestra como alquilada.")) {
      return;
    }
    setLoading(true);
    setError(null);
    const result = await endTenancy(propertyId);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (
      confirm(
        "¿Querés borrar ya el nombre y DNI del inquilino/garante de este contrato finalizado? Se conserva el resto del historial (fechas, monto), pero esto no se puede deshacer.",
      )
    ) {
      await eraseTenancyPersonalData(result.tenancyId);
    }

    setLoading(false);
    router.push("/dashboard/propiedades");
    router.refresh();
  }

  if (activeTenancy) {
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex flex-col">
            <span className="text-sm text-zinc-500">Inquilino</span>
            <span className="font-medium">{activeTenancy.tenantFullName}</span>
            {activeTenancy.tenantDni ? (
              <span className="text-sm text-zinc-500">DNI {activeTenancy.tenantDni}</span>
            ) : null}
          </div>
          {activeTenancy.guarantorFullName ? (
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500">Garante</span>
              <span className="font-medium">{activeTenancy.guarantorFullName}</span>
              {activeTenancy.guarantorDni ? (
                <span className="text-sm text-zinc-500">DNI {activeTenancy.guarantorDni}</span>
              ) : null}
            </div>
          ) : null}
          {activeTenancy.monthlyRentAmount ? (
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500">Monto mensual</span>
              <span className="font-medium">
                {formatArs(activeTenancy.monthlyRentAmount, activeTenancy.priceCurrency ?? "ARS")}
              </span>
            </div>
          ) : null}
          {activeTenancy.startDate ? (
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500">Inicio del contrato</span>
              <span className="font-medium">{activeTenancy.startDate}</span>
            </div>
          ) : null}
          {activeTenancy.notes ? (
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500">Notas</span>
              <span className="whitespace-pre-line">{activeTenancy.notes}</span>
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={handleEndTenancy}
          >
            {loading ? "Finalizando..." : "Finalizar contrato"}
          </Button>
          <a
            href={`/dashboard/propiedades/${propertyId}/alquilar/pagos`}
            className="flex min-h-11 items-center underline underline-offset-4"
          >
            Ver pagos
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="flex max-w-xl flex-col gap-3" onSubmit={handleMarkAsRented}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Al guardar, la propiedad deja de mostrarse en el sitio público. Estos
        datos son privados: solo los ve tu cuenta.
      </p>

      <input
        type="text"
        required
        placeholder="Nombre y apellido del inquilino"
        value={tenantFullName}
        onChange={(e) => setTenantFullName(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />
      <input
        type="text"
        placeholder="DNI del inquilino (opcional)"
        value={tenantDni}
        onChange={(e) => setTenantDni(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Nombre del garante (opcional)"
          value={guarantorFullName}
          onChange={(e) => setGuarantorFullName(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <input
          type="text"
          placeholder="DNI del garante (opcional)"
          value={guarantorDni}
          onChange={(e) => setGuarantorDni(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Monto mensual (opcional)"
          value={monthlyRentAmount}
          onChange={(e) => setMonthlyRentAmount(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <select
          value={priceCurrency}
          onChange={(e) => setPriceCurrency(e.target.value as PriceCurrency)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        >
          <option value="ARS">ARS</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Inicio del contrato
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
      </label>

      <textarea
        placeholder="Notas (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="resize-none rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />

      <label className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={dataConsentConfirmed}
          onChange={(e) => setDataConsentConfirmed(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0"
        />
        <span>
          Confirmo que cuento con el consentimiento del inquilino y del
          garante para registrar sus datos personales en este sistema.
        </span>
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={loading || !dataConsentConfirmed}>
        {loading ? "Guardando..." : "Marcar como alquilada"}
      </Button>
    </form>
  );
}
