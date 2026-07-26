"use client";

import { useMemo, useState } from "react";
import { PropertyCard } from "@/components/property/property-card";
import { cn } from "@/lib/utils";
import type {
  OperationType,
  PriceCurrency,
  PropertyType,
} from "@/types/database.types";

export type DisplayProperty = {
  id: string;
  slug: string;
  title: string;
  neighborhoodName: string | null;
  priceAmount: number;
  priceCurrency: PriceCurrency;
  operationType: OperationType;
  propertyType: PropertyType;
  isVerifiedOwner: boolean;
  coverImageUrl: string | null;
};

const OPERATION_OPTIONS: { value: OperationType | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "alquiler_temporal", label: "Temporal" },
];

const PROPERTY_TYPE_OPTIONS: { value: PropertyType | "todos"; label: string }[] = [
  { value: "todos", label: "Todos los tipos" },
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "terreno", label: "Terreno" },
  { value: "local", label: "Local" },
  { value: "oficina", label: "Oficina" },
  { value: "galpon", label: "Galpón" },
  { value: "quinta", label: "Quinta" },
  { value: "otro", label: "Otro" },
];

const PAGE_SIZE = 12;

export function PropertiesExplorer({
  properties,
  neighborhoods,
}: {
  properties: DisplayProperty[];
  neighborhoods: string[];
}) {
  const [operationType, setOperationType] = useState<OperationType | "todas">(
    "todas",
  );
  const [propertyType, setPropertyType] = useState<PropertyType | "todos">(
    "todos",
  );
  const [neighborhood, setNeighborhood] = useState<string>("todos");
  const [priceMax, setPriceMax] = useState<string>("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (operationType !== "todas" && p.operationType !== operationType)
        return false;
      if (propertyType !== "todos" && p.propertyType !== propertyType)
        return false;
      if (neighborhood !== "todos" && p.neighborhoodName !== neighborhood)
        return false;
      if (priceMax && p.priceAmount > Number(priceMax)) return false;
      return true;
    });
  }, [properties, operationType, propertyType, neighborhood, priceMax]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function updateFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Propiedades en Corrientes</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {OPERATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter(setOperationType)(opt.value)}
              className={cn(
                "shrink-0 min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                operationType === opt.value
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={propertyType}
            onChange={(e) =>
              updateFilter(setPropertyType)(e.target.value as PropertyType | "todos")
            }
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          >
            {PROPERTY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={neighborhood}
            onChange={(e) => updateFilter(setNeighborhood)(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          >
            <option value="todos">Todos los barrios</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <input
            type="number"
            inputMode="numeric"
            placeholder="Precio máximo"
            value={priceMax}
            onChange={(e) => updateFilter(setPriceMax)(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            No encontramos propiedades con esos filtros.
          </p>
          <a
            href="/alertas"
            className="text-sm font-medium underline underline-offset-4"
          >
            Creá una alerta y te avisamos
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((p) => (
              <PropertyCard
                key={p.id}
                slug={p.slug}
                title={p.title}
                neighborhoodName={p.neighborhoodName}
                priceAmount={p.priceAmount}
                priceCurrency={p.priceCurrency}
                isVerifiedOwner={p.isVerifiedOwner}
                coverImageUrl={p.coverImageUrl}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="min-h-11 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
              >
                Anterior
              </button>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="min-h-11 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
