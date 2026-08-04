"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { formatArs } from "@/lib/utils";
import { StarIcon, CameraIcon } from "@/components/icons";
import { AMENITY_MAP } from "@/components/hotel/amenities";
import { fadeInUp, springSnappy } from "@/lib/motion";
import type { HotelAmenity, PriceCurrency } from "@/types/database.types";

export function HotelCard({
  slug,
  name,
  neighborhoodName,
  pricePerNight,
  priceCurrency,
  starRating,
  amenities,
  coverImageUrl,
  isVerifiedOwner,
  imageCount,
}: {
  slug: string;
  name: string;
  neighborhoodName?: string | null;
  pricePerNight: number;
  priceCurrency: PriceCurrency;
  starRating?: number | null;
  amenities?: HotelAmenity[];
  coverImageUrl?: string | null;
  isVerifiedOwner?: boolean;
  imageCount?: number;
}) {
  const topAmenities = (amenities ?? []).slice(0, 3);

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={springSnappy}
      className="group"
    >
      <Link
        href={`/hoteles/${slug}`}
        className="flex flex-col overflow-hidden rounded-[26px] bg-surface shadow-sm shadow-black/5 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-black/10"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={name}
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
          <div className="flex items-center justify-between gap-2">
            <span className="line-clamp-1 text-[15px] font-semibold tracking-tight">
              {name}
            </span>
            {starRating ? (
              <span className="flex shrink-0 items-center gap-0.5 text-amber-500">
                {Array.from({ length: starRating }).map((_, i) => (
                  <StarIcon key={i} width={13} height={13} />
                ))}
              </span>
            ) : null}
          </div>
          {neighborhoodName ? (
            <span className="text-sm text-zinc-500">{neighborhoodName}</span>
          ) : null}
          {topAmenities.length > 0 ? (
            <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
              {topAmenities.map((key) => {
                const opt = AMENITY_MAP.get(key);
                if (!opt) return null;
                const Icon = opt.icon;
                return (
                  <span key={key} className="flex items-center gap-1" title={opt.label}>
                    <Icon width={14} height={14} />
                  </span>
                );
              })}
            </div>
          ) : null}
          <span className="mt-1 text-sm font-semibold">
            Desde {formatArs(pricePerNight, priceCurrency)}{" "}
            <span className="font-normal text-zinc-500">/ noche</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
