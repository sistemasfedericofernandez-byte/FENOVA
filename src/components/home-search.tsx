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
    <div className="w-full max-w-xl rounded-[28px] bg-surface/90 p-4 shadow-xl shadow-black/5 backdrop-blur-sm">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {OPERATION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setOperationType(opt.value)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              operationType === opt.value ? "text-accent-foreground" : "text-foreground/60"
            }`}
          >
            {operationType === opt.value ? (
              <motion.span
                layoutId="home-operation-pill"
                transition={springSoft}
                className="absolute inset-0 rounded-full bg-accent"
              />
            ) : (
              <span className="absolute inset-0 rounded-full bg-accent-soft/60" />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value as PropertyType | "")}
          className="rounded-xl border-0 bg-accent-soft/60 px-3 py-2.5 text-base sm:text-sm"
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
          className="rounded-xl border-0 bg-accent-soft/60 px-3 py-2.5 text-base sm:text-sm"
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
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/25 transition-colors hover:bg-accent-strong"
        >
          <SearchIcon width={16} height={16} />
          Buscar
        </motion.button>
      </div>
    </div>
  );
}
