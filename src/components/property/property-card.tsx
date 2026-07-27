import Image from "next/image";
import Link from "next/link";
import { formatArs } from "@/lib/utils";
import { BedIcon, BathIcon, RulerIcon, CameraIcon } from "@/components/icons";
import type { PriceCurrency } from "@/types/database.types";

export function PropertyCard({
  slug,
  title,
  neighborhoodName,
  priceAmount,
  priceCurrency,
  coverImageUrl,
  isVerifiedOwner,
  surfaceTotalM2,
  bedrooms,
  bathrooms,
  imageCount,
}: {
  slug: string;
  title: string;
  neighborhoodName?: string | null;
  priceAmount: number;
  priceCurrency: PriceCurrency;
  coverImageUrl?: string | null;
  isVerifiedOwner?: boolean;
  surfaceTotalM2?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  imageCount?: number;
}) {
  const hasSpecs = Boolean(surfaceTotalM2 || bedrooms || bathrooms);

  return (
    <Link
      href={`/propiedades/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 transition-shadow hover:shadow-md dark:border-zinc-800"
    >
      <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : null}
        {isVerifiedOwner ? (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-xs font-medium text-white">
            Propietario Seguro
          </span>
        ) : null}
        {imageCount && imageCount > 1 ? (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
            <CameraIcon width={12} height={12} />
            {imageCount}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="font-semibold">
          {formatArs(priceAmount, priceCurrency)}
        </span>
        <span className="line-clamp-1 text-sm text-zinc-700 dark:text-zinc-300">
          {title}
        </span>
        {neighborhoodName ? (
          <span className="text-sm text-zinc-500">{neighborhoodName}</span>
        ) : null}
        {hasSpecs ? (
          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
            {surfaceTotalM2 ? (
              <span className="flex items-center gap-1">
                <RulerIcon width={14} height={14} />
                {surfaceTotalM2} m²
              </span>
            ) : null}
            {bedrooms ? (
              <span className="flex items-center gap-1">
                <BedIcon width={14} height={14} />
                {bedrooms}
              </span>
            ) : null}
            {bathrooms ? (
              <span className="flex items-center gap-1">
                <BathIcon width={14} height={14} />
                {bathrooms}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
