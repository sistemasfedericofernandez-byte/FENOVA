"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { createSearchAlert } from "@/server/actions/alerts";
import type { OperationType, PropertyType } from "@/types/database.types";

export function AlertForm({
  neighborhoods,
}: {
  neighborhoods: { id: string; name: string }[];
}) {
  const [email, setEmail] = useState("");
  const [operationType, setOperationType] = useState<OperationType | "">("");
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [rawQueryText, setRawQueryText] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createSearchAlert({
      email,
      operationType: operationType || undefined,
      propertyType: propertyType || undefined,
      neighborhoodId: neighborhoodId || undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      rawQueryText: rawQueryText || undefined,
    });

    setLoading(false);

    if (!result.ok) {
      setStatus("error");
      setError(
        typeof result.error === "string"
          ? result.error
          : "No se pudo crear la alerta",
      );
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        ¡Listo! Te vamos a avisar por email en cuanto tengamos algo para vos.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={operationType}
          onChange={(e) => setOperationType(e.target.value as OperationType | "")}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
        >
          <option value="">Cualquier operación</option>
          <option value="venta">Venta</option>
          <option value="alquiler">Alquiler</option>
          <option value="alquiler_temporal">Alquiler temporal</option>
        </select>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value as PropertyType | "")}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
        >
          <option value="">Cualquier tipo</option>
          <option value="casa">Casa</option>
          <option value="departamento">Departamento</option>
          <option value="terreno">Terreno</option>
          <option value="local">Local</option>
          <option value="oficina">Oficina</option>
          <option value="galpon">Galpón</option>
          <option value="quinta">Quinta</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <select
        value={neighborhoodId}
        onChange={(e) => setNeighborhoodId(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
      >
        <option value="">Cualquier barrio</option>
        {neighborhoods.map((n) => (
          <option key={n.id} value={n.id}>
            {n.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        inputMode="numeric"
        placeholder="Precio máximo en ARS (opcional)"
        value={priceMax}
        onChange={(e) => setPriceMax(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
      />

      <textarea
        placeholder='Ej: "Monoambiente centro hasta $200.000"'
        value={rawQueryText}
        onChange={(e) => setRawQueryText(e.target.value)}
        rows={3}
        className="resize-none rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear alerta"}
      </Button>
    </form>
  );
}
