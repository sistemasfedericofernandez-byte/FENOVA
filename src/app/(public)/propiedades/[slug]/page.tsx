import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WhatsappButton } from "@/components/property/whatsapp-button";
import { ViewTracker } from "@/components/property/view-tracker";
import { PropertyGallery } from "@/components/property/property-gallery";
import { ShareButton } from "@/components/property/share-button";
import { PropertyMap } from "@/components/property/property-map";
import { BedIcon, BathIcon, RulerIcon } from "@/components/icons";
import { getPublishedPropertyBySlug } from "@/server/services/public-properties";
import { formatArs } from "@/lib/utils";
import type { PriceCurrency } from "@/types/database.types";

const OPERATION_LABEL: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
  alquiler_temporal: "Alquiler temporal",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

      <PropertyGallery images={property.images} title={property.title} />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
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
          <ShareButton
            title={property.title}
            url={`${siteUrl}/propiedades/${slug}`}
          />
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

        {property.surfaceTotalM2 || property.bedrooms || property.bathrooms ? (
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            {property.surfaceTotalM2 ? (
              <span className="flex items-center gap-1.5">
                <RulerIcon width={18} height={18} />
                {property.surfaceTotalM2} m²
              </span>
            ) : null}
            {property.bedrooms ? (
              <span className="flex items-center gap-1.5">
                <BedIcon width={18} height={18} />
                {property.bedrooms} dorm.
              </span>
            ) : null}
            {property.bathrooms ? (
              <span className="flex items-center gap-1.5">
                <BathIcon width={18} height={18} />
                {property.bathrooms} baños
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="text-sm text-zinc-500">Publicado por</div>
        <div className="font-semibold">{property.agencyName}</div>
      </div>

      {property.description ? (
        <p className="whitespace-pre-line text-zinc-700 dark:text-zinc-300">
          {property.description}
        </p>
      ) : null}

      {property.lat != null && property.lng != null ? (
        <PropertyMap lat={property.lat} lng={property.lng} />
      ) : null}

      {property.whatsappNumber ? (
        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] flex justify-center sm:static sm:bottom-auto sm:justify-start">
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
