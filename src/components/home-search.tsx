"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { SearchIcon } from "@/components/icons";
import { springSoft, springSnappy } from "@/lib/motion";
import type { OperationType, PropertyType } from "@/types/database.types";

const OPERATION_OPTIONS: { value: OperationType; label: string }[] = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "alquiler_temporal", label: "Temporal" },
];

export function HomeSearch({
  neighborhoods,
}: {
  neighborhoods: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [operationType, setOperationType] = useState<OperationType>("venta");
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [neighborhood, setNeighborhood] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    params.set("operacion", operationType);
    if (propertyType) params.set("tipo", propertyType);
    if (neighborhood) params.set("barrio", neighborhood);
    router.push(`/propiedades?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-zinc-200/80 bg-white/90 p-3 shadow-lg shadow-zinc-900/5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {OPERATION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setOperationType(opt.value)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              operationType === opt.value
                ? "text-white dark:text-zinc-900"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {operationType === opt.value ? (
              <motion.span
                layoutId="home-operation-pill"
                transition={springSoft}
                className="absolute inset-0 rounded-full bg-zinc-900 dark:bg-white"
              />
            ) : (
              <span className="absolute inset-0 rounded-full border border-zinc-300 dark:border-zinc-700" />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value as PropertyType | "")}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
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

        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        >
          <option value="">Cualquier barrio</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.name}>
              {n.name}
            </option>
          ))}
        </select>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          transition={springSnappy}
          onClick={handleSearch}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
        >
          <SearchIcon width={16} height={16} />
          Buscar
        </motion.button>
      </div>
    </div>
  );
}
