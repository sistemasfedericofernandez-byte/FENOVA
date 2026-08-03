import type { Metadata } from "next";
import { HotelsExplorer } from "@/components/hotel/hotels-explorer";
import { getActiveNeighborhoodNames } from "@/server/services/public-properties";
import { getPublishedHotels } from "@/server/services/public-hotels";

export const metadata: Metadata = {
  title: "Hoteles en Corrientes",
  description:
    "Encontrá hoteles y alojamientos en Corrientes: precio por noche, amenities y contacto directo por WhatsApp.",
};

export default async function HotelesPage() {
  const [hotels, neighborhoodNames] = await Promise.all([
    getPublishedHotels(),
    getActiveNeighborhoodNames(),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:py-8">
      <HotelsExplorer hotels={hotels} neighborhoods={neighborhoodNames} />
    </main>
  );
}
