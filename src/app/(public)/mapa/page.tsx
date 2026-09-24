import type { Metadata } from "next";
import { ListingsMap } from "@/components/map/listings-map";
import { getMapListings } from "@/server/services/map-listings";

export const metadata: Metadata = {
  title: "Mapa de propiedades y hoteles",
  description:
    "Mirá en el mapa de Corrientes dónde queda cada propiedad y cada hotel, con su precio a simple vista.",
};

export default async function MapaPage() {
  const listings = await getMapListings();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Mapa de Corrientes</h1>
        <p className="text-foreground/75">
          Propiedades y hoteles con su precio, ubicados donde quedan.
        </p>
      </div>

      {listings.length ? (
        <ListingsMap listings={listings} />
      ) : (
        <p className="glass rounded-2xl p-6 text-foreground/80">
          Todavía no hay avisos para mostrar en el mapa.
        </p>
      )}
    </main>
  );
}
