import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { ListingGrid } from "@/components/seo/listing-grid";
import { JsonLd, breadcrumbs } from "@/components/seo/json-ld";
import { neighborhoodSlug } from "@/lib/corrientes";
import { getPublishedProperties } from "@/server/services/public-properties";
import type { OperationType } from "@/types/database.types";

export const LANDINGS: Record<
  OperationType,
  {
    path: string;
    title: string;
    description: string;
    h1: string;
    paragraphs: string[];
    faq: { q: string; a: string }[];
  }
> = {
  alquiler: {
    path: "/alquiler-en-corrientes",
    title: "Alquiler de casas y departamentos en Corrientes",
    description:
      "Departamentos, casas y monoambientes en alquiler en Corrientes Capital. Mirá fotos, precios y ubicación en el mapa, y escribile directo a la inmobiliaria por WhatsApp.",
    h1: "Alquiler de casas y departamentos en Corrientes",
    paragraphs: [
      "Encontrá tu próximo alquiler en la ciudad de Corrientes: departamentos, casas, monoambientes y locales publicados por inmobiliarias y propietarios. Cada aviso muestra las fotos, el precio y dónde queda, así comparás sin perder tiempo.",
      "No hace falta registrarse. Elegís la propiedad que te interesa y le escribís directo a la inmobiliaria por WhatsApp: el mensaje ya sale con el aviso adjunto para que sepan cuál es.",
    ],
    faq: [
      {
        q: "¿Cómo alquilo una propiedad en Corrientes desde PropiMarket?",
        a: "Buscás el aviso que te gusta y tocás “Contactar por WhatsApp”. Coordinás la visita y los requisitos directamente con la inmobiliaria o el propietario.",
      },
      {
        q: "¿Cuánto cuesta usar PropiMarket para buscar?",
        a: "Buscar y contactar es gratis y sin registro. PropiMarket no interviene en el contrato ni en los pagos del alquiler.",
      },
      {
        q: "¿Puedo ver dónde queda cada propiedad?",
        a: "Sí. Cada aviso muestra la zona en un mapa y hay un mapa general de Corrientes con los precios.",
      },
    ],
  },
  venta: {
    path: "/venta-en-corrientes",
    title: "Casas, departamentos y terrenos en venta en Corrientes",
    description:
      "Propiedades en venta en Corrientes Capital: casas, departamentos, terrenos y locales. Precios, fotos y ubicación en el mapa, con contacto directo por WhatsApp.",
    h1: "Casas, departamentos y terrenos en venta en Corrientes",
    paragraphs: [
      "Explorá las propiedades en venta en la ciudad de Corrientes: casas, departamentos, terrenos, locales y más, publicadas por inmobiliarias y propietarios de la zona.",
      "Compará precios y ubicaciones, mirá las fotos y escribile directo a quien publica por WhatsApp. Sin registro y sin intermediarios en la plataforma.",
    ],
    faq: [
      {
        q: "¿Cómo compro una propiedad publicada en PropiMarket?",
        a: "Contactás a la inmobiliaria o al propietario por WhatsApp desde el aviso y coordinan la visita y la operación entre ustedes.",
      },
      {
        q: "¿Los precios están en pesos o en dólares?",
        a: "Cada aviso indica su moneda. Muchas propiedades en venta se publican en dólares.",
      },
      {
        q: "¿Qué es el sello Propietario Seguro?",
        a: "Es una verificación opcional que hacen las inmobiliarias y propietarios para dar más confianza en sus avisos.",
      },
    ],
  },
  alquiler_temporal: {
    path: "/alquiler-temporal-en-corrientes",
    title: "Alquiler temporal en Corrientes: departamentos y casas por día",
    description:
      "Alquileres temporales en Corrientes Capital para turismo, trabajo o estadías cortas. Fotos, precios y contacto directo por WhatsApp.",
    h1: "Alquiler temporal en Corrientes",
    paragraphs: [
      "Departamentos y casas para estadías cortas en Corrientes: turismo, trabajo o visitas. Mirá fotos, precios y ubicación, y consultá disponibilidad directo con quien publica.",
      "También podés ver los hoteles de la ciudad en la sección de hoteles y compararlos por precio por noche y servicios.",
    ],
    faq: [
      {
        q: "¿Cómo reservo un alquiler temporal?",
        a: "Escribís por WhatsApp desde el aviso, consultás disponibilidad y coordinás fechas y forma de pago directamente con quien publica.",
      },
      {
        q: "¿Hay hoteles también?",
        a: "Sí. En la sección Hoteles ves los alojamientos de Corrientes con su precio por noche.",
      },
    ],
  },
};

export async function OperationLanding({ operation }: { operation: OperationType }) {
  const landing = LANDINGS[operation];
  const all = await getPublishedProperties();
  const properties = all.filter((p) => p.operationType === operation);

  const barrios = [...new Set(properties.map((p) => p.neighborhoodName).filter(Boolean))] as string[];
  const otherLandings = (Object.keys(LANDINGS) as OperationType[]).filter((key) => key !== operation);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbs([
          { name: "Inicio", path: "/" },
          { name: landing.h1, path: landing.path },
        ])}
      />

      <header className="flex max-w-3xl flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{landing.h1}</h1>
        {landing.paragraphs.map((text) => (
          <p key={text} className="leading-relaxed text-foreground/80">
            {text}
          </p>
        ))}
      </header>

      {properties.length ? (
        <section aria-label="Propiedades disponibles" className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">
            {properties.length} {properties.length === 1 ? "propiedad disponible" : "propiedades disponibles"}
          </h2>
          <ListingGrid>
            {properties.slice(0, 60).map((p) => (
              <PropertyCard key={p.id} {...p} />
            ))}
          </ListingGrid>
        </section>
      ) : (
        <p className="glass rounded-2xl p-6 text-foreground/80">
          Por ahora no hay avisos en esta categoría. Volvé pronto o{" "}
          <Link href="/alertas" className="font-semibold underline underline-offset-4">
            creá una alerta
          </Link>{" "}
          y te avisamos apenas se publique algo.
        </p>
      )}

      {barrios.length ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Buscá por barrio</h2>
          <ul className="flex flex-wrap gap-2">
            {barrios.sort().map((name) => (
              <li key={name}>
                <Link
                  href={`/barrios/${neighborhoodSlug(name)}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold text-accent-strong hover:border-accent-strong"
                >
                  Barrio {name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Preguntas frecuentes</h2>
        <dl className="flex flex-col gap-4">
          {landing.faq.map((item) => (
            <div key={item.q} className="flex flex-col gap-1">
              <dt className="font-semibold">{item.q}</dt>
              <dd className="text-foreground/80">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label="Otras búsquedas" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {otherLandings.map((key) => (
          <Link
            key={key}
            href={LANDINGS[key].path}
            className="font-semibold text-accent-strong underline underline-offset-4"
          >
            {LANDINGS[key].h1}
          </Link>
        ))}
        <Link href="/hoteles" className="font-semibold text-accent-strong underline underline-offset-4">
          Hoteles en Corrientes
        </Link>
        <Link href="/mapa" className="font-semibold text-accent-strong underline underline-offset-4">
          Ver el mapa con precios
        </Link>
      </nav>
    </main>
  );
}
