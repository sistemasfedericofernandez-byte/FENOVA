import type { Metadata } from "next";
import { PropertiesExplorer } from "@/components/property/properties-explorer";
import {
  getActiveNeighborhoodNames,
  getPublishedProperties,
} from "@/server/services/public-properties";

export const metadata: Metadata = {
  title: "Propiedades en Corrientes",
  description:
    "Filtrá propiedades en venta, alquiler y alquiler temporal en Corrientes por barrio, precio y tipo.",
};

export default async function PropiedadesPage() {
  const [properties, neighborhoods] = await Promise.all([
    getPublishedProperties(),
    getActiveNeighborhoodNames(),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:py-8">
      <PropertiesExplorer properties={properties} neighborhoods={neighborhoods} />
    </main>
  );
}
