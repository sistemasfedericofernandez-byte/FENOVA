import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { HotelCard } from "@/components/hotel/hotel-card";
import { HomeSearch } from "@/components/home-search";
import { HomeHero } from "@/components/home-hero";
import { CategorySection } from "@/components/home/category-section";
import { RevealGrid } from "@/components/home/reveal-grid";
import {
  getActiveNeighborhoodNames,
  getPublishedProperties,
} from "@/server/services/public-properties";
import { getPublishedHotels } from "@/server/services/public-hotels";

export default async function HomePage() {
  const [properties, neighborhoodNames, hotels] = await Promise.all([
    getPublishedProperties(),
    getActiveNeighborhoodNames(),
    getPublishedHotels(),
  ]);
  const neighborhoods = neighborhoodNames.map((name) => ({ id: name, name }));

  const enVenta = properties.filter((p) => p.operationType === "venta").slice(0, 3);
  const enAlquiler = properties
    .filter((p) => p.operationType === "alquiler")
    .slice(0, 3);
  const temporal = properties
    .filter((p) => p.operationType === "alquiler_temporal")
    .slice(0, 3);
  const destacadosHoteles = hotels.slice(0, 3);

  return (
    <main className="flex min-h-screen flex-col">
      <HomeHero>
        <HomeSearch neighborhoods={neighborhoods} />
      </HomeHero>

      {enAlquiler.length > 0 ? (
        <CategorySection
          eyebrow="Para vivir"
          title="En alquiler"
          description="Departamentos y casas listos para mudarte, con contacto directo por WhatsApp."
          href="/propiedades?operacion=alquiler"
          hrefLabel="Ver todos los alquileres"
          tone="tint"
        >
          <RevealGrid>
            {enAlquiler.map((p) => (
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
          </RevealGrid>
        </CategorySection>
      ) : null}

      {temporal.length > 0 ? (
        <CategorySection
          eyebrow="Escapadas"
          title="Alquiler temporal"
          description="Ideal para vacaciones o estadías cortas en Corrientes."
          href="/propiedades?operacion=alquiler_temporal"
          hrefLabel="Ver todo lo temporal"
          tone="plain"
        >
          <RevealGrid>
            {temporal.map((p) => (
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
          </RevealGrid>
        </CategorySection>
      ) : null}

      {destacadosHoteles.length > 0 ? (
        <CategorySection
          eyebrow="Hospedaje"
          title="Hoteles en Corrientes"
          description="Establecimientos completos con precio por noche, categoría y servicios."
          href="/hoteles"
          hrefLabel="Ver todos los hoteles"
          tone="tint"
        >
          <RevealGrid>
            {destacadosHoteles.map((h) => (
              <HotelCard
                key={h.id}
                slug={h.slug}
                name={h.name}
                neighborhoodName={h.neighborhoodName}
                pricePerNight={h.pricePerNight}
                priceCurrency={h.priceCurrency}
                starRating={h.starRating}
                amenities={h.amenities}
                coverImageUrl={h.coverImageUrl}
                isVerifiedOwner={h.isVerifiedOwner}
                imageCount={h.imageCount}
              />
            ))}
          </RevealGrid>
        </CategorySection>
      ) : null}

      {enVenta.length > 0 ? (
        <CategorySection
          eyebrow="Para invertir"
          title="En venta"
          description="Casas, departamentos y terrenos para comprar en Corrientes."
          href="/propiedades?operacion=venta"
          hrefLabel="Ver todas en venta"
          tone="plain"
        >
          <RevealGrid>
            {enVenta.map((p) => (
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
          </RevealGrid>
        </CategorySection>
      ) : null}

      <section className="flex w-full flex-col items-center gap-4 px-6 py-16 text-center sm:py-24">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          ¿Tenés una <span className="text-accent-strong">inmobiliaria</span>,
          hotel o propiedad para publicar?
        </h2>
        <p className="max-w-md text-sm text-foreground/60">
          Sumate a FENOVA y llegá a quienes buscan propiedades y hoteles en
          Corrientes todos los días.
        </p>
        <Link
          href="/registro"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm shadow-accent/25 transition-colors hover:bg-accent-strong"
        >
          Crear cuenta gratis
        </Link>
      </section>
    </main>
  );
}
