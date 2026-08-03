import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WhatsappButton } from "@/components/property/whatsapp-button";
import { ViewTracker } from "@/components/property/view-tracker";
import { PropertyGallery } from "@/components/property/property-gallery";
import { ShareButton } from "@/components/property/share-button";
import { PropertyMap } from "@/components/property/property-map";
import { StarIcon } from "@/components/icons";
import { AMENITY_MAP } from "@/components/hotel/amenities";
import { getPublishedHotelBySlug } from "@/server/services/public-hotels";
import { formatArs } from "@/lib/utils";
import type { PriceCurrency } from "@/types/database.types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getPublishedHotelBySlug(slug);

  if (!hotel) {
    return { title: "Hotel no encontrado" };
  }

  const description = `Hotel en ${hotel.neighborhoodName ?? "Corrientes"} — desde ${formatArs(
    hotel.pricePerNight,
    hotel.priceCurrency as PriceCurrency,
  )} por noche`;

  return {
    title: hotel.name,
    description,
    openGraph: {
      title: hotel.name,
      description,
      images: hotel.images[0] ? [{ url: hotel.images[0] }] : undefined,
    },
  };
}

export default async function HotelDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hotel = await getPublishedHotelBySlug(slug);

  if (!hotel) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-6 sm:py-8">
      <ViewTracker propertyId={hotel.id} kind="hotel" />

      <PropertyGallery images={hotel.images} title={hotel.name} />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800">
              Hotel
            </span>
            {hotel.isVerifiedOwner ? (
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                Propietario Seguro
              </span>
            ) : null}
          </div>
          <ShareButton title={hotel.name} url={`${siteUrl}/hoteles/${slug}`} />
        </div>

        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{hotel.name}</h1>
          {hotel.starRating ? (
            <span className="flex shrink-0 items-center gap-0.5 text-amber-500">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <StarIcon key={i} width={16} height={16} />
              ))}
            </span>
          ) : null}
        </div>
        {hotel.neighborhoodName ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            {hotel.neighborhoodName}, Corrientes
          </p>
        ) : null}
        <p className="text-2xl font-bold">
          {formatArs(hotel.pricePerNight, hotel.priceCurrency as PriceCurrency)}{" "}
          <span className="text-base font-normal text-zinc-500">/ noche</span>
        </p>
        {hotel.totalRooms ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {hotel.totalRooms} habitaciones
          </p>
        ) : null}
      </div>

      {hotel.amenities.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Servicios</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {hotel.amenities.map((key) => {
              const opt = AMENITY_MAP.get(key);
              if (!opt) return null;
              const Icon = opt.icon;
              return (
                <span
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                >
                  <Icon width={16} height={16} />
                  {opt.label}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="text-sm text-zinc-500">Publicado por</div>
        <div className="font-semibold">{hotel.agencyName}</div>
      </div>

      {hotel.description ? (
        <p className="whitespace-pre-line text-zinc-700 dark:text-zinc-300">
          {hotel.description}
        </p>
      ) : null}

      {hotel.lat != null && hotel.lng != null ? (
        <PropertyMap lat={hotel.lat} lng={hotel.lng} />
      ) : null}

      {hotel.whatsappNumber ? (
        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] flex justify-center sm:static sm:bottom-auto sm:justify-start">
          <WhatsappButton
            phone={hotel.whatsappNumber}
            propertyId={hotel.id}
            propertyTitle={hotel.name}
            kind="hotel"
          />
        </div>
      ) : null}
    </main>
  );
}
