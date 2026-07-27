import type { Metadata } from "next";
import { PropertiesExplorer } from "@/components/property/properties-explorer";
import {
  getActiveNeighborhoodNames,
  getPublishedProperties,
} from "@/server/services/public-properties";
import type { OperationType, PropertyType } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Propiedades en Corrientes",
  description:
    "Filtrá propiedades en venta, alquiler y alquiler temporal en Corrientes por barrio, precio y tipo.",
};

const VALID_OPERATIONS: OperationType[] = ["venta", "alquiler", "alquiler_temporal"];
const VALID_TYPES: PropertyType[] = [
  "casa",
  "departamento",
  "terreno",
  "local",
  "oficina",
  "galpon",
  "quinta",
  "otro",
];

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<{ operacion?: string; tipo?: string; barrio?: string }>;
}) {
  const params = await searchParams;
  const [properties, neighborhoods] = await Promise.all([
    getPublishedProperties(),
    getActiveNeighborhoodNames(),
  ]);

  const initialOperationType = VALID_OPERATIONS.includes(
    params.operacion as OperationType,
  )
    ? (params.operacion as OperationType)
    : "todas";
  const initialPropertyType = VALID_TYPES.includes(params.tipo as PropertyType)
    ? (params.tipo as PropertyType)
    : "todos";
  const initialNeighborhood = params.barrio ?? "todos";

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:py-8">
      <PropertiesExplorer
        properties={properties}
        neighborhoods={neighborhoods}
        initialOperationType={initialOperationType}
        initialPropertyType={initialPropertyType}
        initialNeighborhood={initialNeighborhood}
      />
    </main>
  );
}
