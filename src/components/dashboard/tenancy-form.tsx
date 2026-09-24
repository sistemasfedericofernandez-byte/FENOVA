"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { buttonClass } from "@/lib/button-styles";
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-zinc-600">{label}</span>
      <span className="text-base font-semibold text-zinc-900">{value}</span>
    </div>
  );
}

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

    router.push("/dashboard/alquileres");
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
    router.push("/dashboard/alquileres");
    router.refresh();
  }

  if (activeTenancy) {
    return (
      <div className="flex max-w-2xl flex-col gap-5">
        <section className="card flex flex-col gap-5 p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-bold text-[#0d2740]">Inquilino</h2>
              <Detail label="Nombre" value={activeTenancy.tenantFullName} />
              {activeTenancy.tenantDni ? <Detail label="DNI" value={activeTenancy.tenantDni} /> : null}
            </div>
            {activeTenancy.guarantorFullName ? (
              <div className="flex flex-col gap-3">
                <h2 className="text-base font-bold text-[#0d2740]">Garante</h2>
                <Detail label="Nombre" value={activeTenancy.guarantorFullName} />
                {activeTenancy.guarantorDni ? (
                  <Detail label="DNI" value={activeTenancy.guarantorDni} />
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid gap-5 border-t border-zinc-200 pt-5 sm:grid-cols-2">
            {activeTenancy.monthlyRentAmount ? (
              <Detail
                label="Monto mensual"
                value={formatArs(activeTenancy.monthlyRentAmount, activeTenancy.priceCurrency ?? "ARS")}
              />
            ) : null}
            {activeTenancy.startDate ? (
              <Detail label="Inicio del contrato" value={activeTenancy.startDate} />
            ) : null}
          </div>

          {activeTenancy.notes ? (
            <div className="flex flex-col border-t border-zinc-200 pt-5">
              <span className="text-sm font-medium text-zinc-600">Notas</span>
              <span className="whitespace-pre-line text-base text-zinc-900">{activeTenancy.notes}</span>
            </div>
          ) : null}
        </section>

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/dashboard/propiedades/${propertyId}/alquilar/pagos`}
            className={buttonClass("primary", "sm:flex-1")}
          >
            Ver cobros de cada mes
          </Link>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={handleEndTenancy}
            className="sm:flex-1"
          >
            {loading ? "Finalizando..." : "Finalizar contrato"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="card flex max-w-2xl flex-col gap-5 p-5 sm:p-6" onSubmit={handleMarkAsRented}>
      <p className="rounded-xl bg-[#f4e8cd] p-3 text-sm text-[#3a2c0c]">
        Al guardar, la propiedad deja de mostrarse en el sitio público. Estos datos son privados:
        solo los ve tu cuenta.
      </p>

      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-[#0d2740]">Inquilino</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre y apellido">
            <input
              type="text"
              required
              value={tenantFullName}
              onChange={(e) => setTenantFullName(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="DNI" hint="Opcional. Se guarda encriptado.">
            <input
              type="text"
              inputMode="numeric"
              value={tenantDni}
              onChange={(e) => setTenantDni(e.target.value)}
              className="field"
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-[#0d2740]">Garante (opcional)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre y apellido">
            <input
              type="text"
              value={guarantorFullName}
              onChange={(e) => setGuarantorFullName(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="DNI">
            <input
              type="text"
              inputMode="numeric"
              value={guarantorDni}
              onChange={(e) => setGuarantorDni(e.target.value)}
              className="field"
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-[#0d2740]">Alquiler</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Monto mensual">
            <input
              type="number"
              inputMode="decimal"
              value={monthlyRentAmount}
              onChange={(e) => setMonthlyRentAmount(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Moneda">
            <select
              value={priceCurrency}
              onChange={(e) => setPriceCurrency(e.target.value as PriceCurrency)}
              className="field"
            >
              <option value="ARS">Pesos (ARS)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </Field>
          <Field label="Inicio del contrato">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="field"
            />
          </Field>
        </div>
        <Field label="Notas" hint="Opcional. Por ejemplo: aumento cada 6 meses, depósito, condiciones.">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="field resize-none"
          />
        </Field>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-800">
        <input
          type="checkbox"
          checked={dataConsentConfirmed}
          onChange={(e) => setDataConsentConfirmed(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0"
        />
        <span>
          Confirmo que cuento con el consentimiento del inquilino y del garante para registrar sus
          datos personales en este sistema.
        </span>
      </label>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <Button type="submit" disabled={loading || !dataConsentConfirmed}>
        {loading ? "Guardando..." : "Marcar como alquilada"}
      </Button>
    </form>
  );
}
