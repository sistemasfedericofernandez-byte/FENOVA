import Image from "next/image";
import Link from "next/link";
import { formatArs } from "@/lib/utils";
import type { PriceCurrency } from "@/types/database.types";

export function PropertyCard({
  slug,
  title,
  neighborhoodName,
  priceAmount,
  priceCurrency,
  coverImageUrl,
  isVerifiedOwner,
}: {
  slug: string;
  title: string;
  neighborhoodName?: string | null;
  priceAmount: number;
  priceCurrency: PriceCurrency;
  coverImageUrl?: string | null;
  isVerifiedOwner?: boolean;
}) {
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
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="line-clamp-1 font-medium">{title}</span>
        {neighborhoodName ? (
          <span className="text-sm text-zinc-500">{neighborhoodName}</span>
        ) : null}
        <span className="font-semibold">
          {formatArs(priceAmount, priceCurrency)}
        </span>
      </div>
    </Link>
  );
}
