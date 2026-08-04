import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { HomeSearch } from "@/components/home-search";
import { HomeHero } from "@/components/home-hero";
import {
  getActiveNeighborhoodNames,
  getPublishedProperties,
} from "@/server/services/public-properties";

export default async function HomePage() {
  const [properties, neighborhoodNames] = await Promise.all([
    getPublishedProperties(),
    getActiveNeighborhoodNames(),
  ]);
  const featured = properties.slice(0, 3);
  const neighborhoods = neighborhoodNames.map((name) => ({ id: name, name }));

  return (
    <main className="flex min-h-screen flex-col">
      <HomeHero>
        <HomeSearch neighborhoods={neighborhoods} />

        <Link
          href="/hoteles"
          className="text-sm font-medium text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          ¿Buscás un hotel en Corrientes? Ver hoteles →
        </Link>
      </HomeHero>

      {featured.length > 0 ? (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-16">
          <h2 className="text-xl font-semibold tracking-tight">Destacadas</h2>
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
                surfaceTotalM2={p.surfaceTotalM2}
                bedrooms={p.bedrooms}
                bathrooms={p.bathrooms}
                imageCount={p.imageCount}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
