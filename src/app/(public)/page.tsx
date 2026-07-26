import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { getPublishedProperties } from "@/server/services/public-properties";

export default async function HomePage() {
  const properties = await getPublishedProperties();
  const featured = properties.slice(0, 3);

  return (
    <main className="flex min-h-screen flex-col">
      <section className="flex flex-col items-center gap-4 px-6 py-16 text-center sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Argentina Inmuebles
        </h1>
        <p className="max-w-md text-base text-zinc-600 dark:text-zinc-400">
          Marketplace inmobiliario de Corrientes. Buscá propiedades en venta,
          alquiler o alquiler temporal sin necesidad de registrarte.
        </p>
        <Link
          href="/propiedades"
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
        >
          Buscar propiedades
        </Link>
      </section>

      {featured.length > 0 ? (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-16">
          <h2 className="text-xl font-semibold">Destacadas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
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
        </section>
      ) : null}
    </main>
  );
}
