import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { WhatsappButton } from "@/components/property/whatsapp-button";
import { ViewTracker } from "@/components/property/view-tracker";
import { getPublishedPropertyBySlug } from "@/server/services/public-properties";
import { formatArs } from "@/lib/utils";
import type { PriceCurrency } from "@/types/database.types";

const OPERATION_LABEL: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
  alquiler_temporal: "Alquiler temporal",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);

  if (!property) {
    return { title: "Propiedad no encontrada" };
  }

  const description = `${OPERATION_LABEL[property.operationType] ?? property.operationType} en ${
    property.neighborhoodName ?? "Corrientes"
  } — ${formatArs(property.priceAmount, property.priceCurrency as PriceCurrency)}`;

  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      images: property.images[0] ? [{ url: property.images[0] }] : undefined,
    },
  };
}

export default async function PropiedadDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-6 sm:py-8">
      <ViewTracker propertyId={property.id} />
      {property.images.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {property.images.map((url, index) => (
            <div
              key={url}
              className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 ${
                index === 0 ? "sm:col-span-2" : ""
              }`}
            >
              <Image
                src={url}
                alt={`${property.title} - foto ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 800px"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="aspect-[4/3] w-full rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
            {OPERATION_LABEL[property.operationType] ?? property.operationType}
          </span>
          {property.isVerifiedOwner ? (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
              Propietario Seguro
            </span>
          ) : null}
        </div>

        <h1 className="text-2xl font-semibold">{property.title}</h1>
        {property.neighborhoodName ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            {property.neighborhoodName}, Corrientes
          </p>
        ) : null}
        <p className="text-2xl font-bold">
          {formatArs(
            property.priceAmount,
            property.priceCurrency as PriceCurrency,
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-xl border border-zinc-200 p-4 text-center dark:border-zinc-800 sm:grid-cols-4">
        {property.surfaceTotalM2 ? (
          <div>
            <div className="font-semibold">{property.surfaceTotalM2} m²</div>
            <div className="text-xs text-zinc-500">Superficie</div>
          </div>
        ) : null}
        {property.bedrooms ? (
          <div>
            <div className="font-semibold">{property.bedrooms}</div>
            <div className="text-xs text-zinc-500">Dormitorios</div>
          </div>
        ) : null}
        {property.bathrooms ? (
          <div>
            <div className="font-semibold">{property.bathrooms}</div>
            <div className="text-xs text-zinc-500">Baños</div>
          </div>
        ) : null}
        <div>
          <div className="font-semibold">{property.agencyName}</div>
          <div className="text-xs text-zinc-500">Publicado por</div>
        </div>
      </div>

      {property.description ? (
        <p className="whitespace-pre-line text-zinc-700 dark:text-zinc-300">
          {property.description}
        </p>
      ) : null}

      {property.whatsappNumber ? (
        <div className="sticky bottom-[calc(1rem+env(safe-area-inset-bottom))] flex justify-center sm:static sm:justify-start">
          <WhatsappButton
            phone={property.whatsappNumber}
            propertyId={property.id}
            propertyTitle={property.title}
          />
        </div>
      ) : null}
    </main>
  );
}

