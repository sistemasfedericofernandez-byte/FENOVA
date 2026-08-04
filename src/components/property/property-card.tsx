"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { formatArs } from "@/lib/utils";
import { BedIcon, BathIcon, RulerIcon, CameraIcon } from "@/components/icons";
import { fadeInUp, springSnappy } from "@/lib/motion";
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
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={springSnappy}
      className="group"
    >
      <Link
        href={`/propiedades/${slug}`}
        className="flex flex-col overflow-hidden rounded-[26px] bg-surface shadow-sm shadow-black/5 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-black/10"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {isVerifiedOwner ? (
            <span className="absolute left-2 top-2 rounded-full bg-emerald-600/95 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Propietario Seguro
            </span>
          ) : null}
          {imageCount && imageCount > 1 ? (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <CameraIcon width={12} height={12} />
              {imageCount}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 p-3.5">
          <span className="text-[15px] font-semibold tracking-tight">
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
    </motion.div>
  );
}
