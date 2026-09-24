import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PropertyCard } from "@/components/property/property-card";
import { ListingGrid } from "@/components/seo/listing-grid";
import { JsonLd, breadcrumbs } from "@/components/seo/json-ld";
import { LANDINGS } from "@/components/seo/operation-landing";
import { neighborhoodSlug } from "@/lib/corrientes";
import { getActiveNeighborhoodNames, getPublishedProperties } from "@/server/services/public-properties";

async function findNeighborhood(slug: string) {
  const names = await getActiveNeighborhoodNames();
  return names.find((name) => neighborhoodSlug(name) === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = await findNeighborhood(slug);
  if (!name) return { title: "Barrio no encontrado", robots: { index: false } };

  const properties = (await getPublishedProperties()).filter((p) => p.neighborhoodName === name);
  const title = `Propiedades en Barrio ${name}, Corrientes Capital`;
  const description = `Casas y departamentos en alquiler y venta en el barrio ${name}, Corrientes Capital. Fotos, precios y contacto directo por WhatsApp.`;

  return {
    title,
    description,
    alternates: { canonical: `/barrios/${slug}` },
    // Un barrio sin avisos no se indexa: evita páginas vacías en Google.
    robots: properties.length ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: `/barrios/${slug}` },
  };
}

export default async function BarrioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const name = await findNeighborhood(slug);
  if (!name) notFound();

  const properties = (await getPublishedProperties()).filter((p) => p.neighborhoodName === name);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbs([
          { name: "Inicio", path: "/" },
          { name: `Barrio ${name}`, path: `/barrios/${slug}` },
        ])}
      />

      <header className="flex max-w-3xl flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Propiedades en Barrio {name}, Corrientes Capital
        </h1>
        <p className="leading-relaxed text-foreground/80">
          Casas, departamentos y otras propiedades en alquiler y en venta en el barrio {name}, dentro de
          la ciudad de Corrientes. Mirá las fotos, el precio y la zona en el mapa, y escribile directo a
          la inmobiliaria por WhatsApp.
        </p>
      </header>

      {properties.length ? (
        <section aria-label="Propiedades del barrio" className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">
            {properties.length} {properties.length === 1 ? "propiedad disponible" : "propiedades disponibles"}
          </h2>
          <ListingGrid>
            {properties.map((p) => (
              <PropertyCard key={p.id} {...p} />
            ))}
          </ListingGrid>
        </section>
      ) : (
        <p className="glass rounded-2xl p-6 text-foreground/80">
          Todavía no hay avisos en este barrio.{" "}
          <Link href="/alertas" className="font-semibold underline underline-offset-4">
            Creá una alerta
          </Link>{" "}
          y te avisamos cuando se publique algo.
        </p>
      )}

      <nav aria-label="Otras búsquedas" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {Object.values(LANDINGS).map((landing) => (
          <Link
            key={landing.path}
            href={landing.path}
            className="font-semibold text-accent-strong underline underline-offset-4"
          >
            {landing.h1}
          </Link>
        ))}
        <Link href="/mapa" className="font-semibold text-accent-strong underline underline-offset-4">
          Ver el mapa con precios
        </Link>
      </nav>
    </main>
  );
}
