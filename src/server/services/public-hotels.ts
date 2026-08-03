import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { HotelAmenity, PriceCurrency } from "@/types/database.types";

export type DisplayHotel = {
  id: string;
  slug: string;
  name: string;
  neighborhoodName: string | null;
  pricePerNight: number;
  priceCurrency: PriceCurrency;
  starRating: number | null;
  amenities: HotelAmenity[];
  isVerifiedOwner: boolean;
  coverImageUrl: string | null;
  imageCount: number;
};

/**
 * Lecturas públicas de hoteles. Igual que en public-properties.ts, la RLS de
 * `hotels` ya filtra a `status = 'publicada'`; se repite acá por claridad.
 */
export async function getPublishedHotels(): Promise<DisplayHotel[]> {
  const supabase = await createClient();

  const { data: hotels } = await supabase
    .from("hotels")
    .select(
      "id, slug, name, price_per_night, price_currency, star_rating, amenities, neighborhood_id, agency_id, created_at",
    )
    .eq("status", "publicada")
    .order("created_at", { ascending: false })
    .limit(300);

  if (!hotels?.length) return [];

  const neighborhoodIds = [
    ...new Set(hotels.map((h) => h.neighborhood_id).filter(Boolean)),
  ] as string[];
  const agencyIds = [...new Set(hotels.map((h) => h.agency_id))];
  const hotelIds = hotels.map((h) => h.id);

  const [{ data: neighborhoods }, { data: agencies }, { data: images }] =
    await Promise.all([
      neighborhoodIds.length
        ? supabase.from("neighborhoods").select("id, name").in("id", neighborhoodIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      supabase.from("agencies").select("id, is_verified_owner").in("id", agencyIds),
      supabase
        .from("hotel_images")
        .select("hotel_id, url, sort_order")
        .in("hotel_id", hotelIds)
        .order("sort_order", { ascending: true }),
    ]);

  const neighborhoodMap = new Map((neighborhoods ?? []).map((n) => [n.id, n.name]));
  const agencyMap = new Map((agencies ?? []).map((a) => [a.id, a.is_verified_owner]));
  const coverImageMap = new Map<string, string>();
  const imageCountMap = new Map<string, number>();
  for (const image of images ?? []) {
    if (!coverImageMap.has(image.hotel_id)) {
      coverImageMap.set(image.hotel_id, image.url);
    }
    imageCountMap.set(image.hotel_id, (imageCountMap.get(image.hotel_id) ?? 0) + 1);
  }

  return hotels.map((h) => ({
    id: h.id,
    slug: h.slug,
    name: h.name,
    neighborhoodName: h.neighborhood_id
      ? (neighborhoodMap.get(h.neighborhood_id) ?? null)
      : null,
    pricePerNight: h.price_per_night,
    priceCurrency: h.price_currency,
    starRating: h.star_rating,
    amenities: h.amenities ?? [],
    isVerifiedOwner: agencyMap.get(h.agency_id) ?? false,
    coverImageUrl: coverImageMap.get(h.id) ?? null,
    imageCount: imageCountMap.get(h.id) ?? 0,
  }));
}

export type PublishedHotelDetail = {
  id: string;
  name: string;
  description: string | null;
  pricePerNight: number;
  priceCurrency: PriceCurrency;
  starRating: number | null;
  totalRooms: number | null;
  amenities: HotelAmenity[];
  neighborhoodName: string | null;
  agencyName: string;
  isVerifiedOwner: boolean;
  whatsappNumber: string | null;
  images: string[];
  lat: number | null;
  lng: number | null;
};

export const getPublishedHotelBySlug = cache(async function getPublishedHotelBySlug(
  slug: string,
): Promise<PublishedHotelDetail | null> {
  const supabase = await createClient();

  const { data: hotel } = await supabase
    .from("hotels")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicada")
    .maybeSingle();

  if (!hotel) return null;

  const [{ data: neighborhood }, { data: agency }, { data: images }] =
    await Promise.all([
      hotel.neighborhood_id
        ? supabase
            .from("neighborhoods")
            .select("name")
            .eq("id", hotel.neighborhood_id)
            .maybeSingle()
        : Promise.resolve({ data: null as { name: string } | null }),
      supabase
        .from("agencies")
        .select("business_name, is_verified_owner, whatsapp_number")
        .eq("id", hotel.agency_id)
        .maybeSingle(),
      supabase
        .from("hotel_images")
        .select("url")
        .eq("hotel_id", hotel.id)
        .order("sort_order", { ascending: true }),
    ]);

  return {
    id: hotel.id,
    name: hotel.name,
    description: hotel.description,
    pricePerNight: hotel.price_per_night,
    priceCurrency: hotel.price_currency,
    starRating: hotel.star_rating,
    totalRooms: hotel.total_rooms,
    amenities: hotel.amenities ?? [],
    neighborhoodName: neighborhood?.name ?? null,
    agencyName: agency?.business_name ?? "Hotel",
    isVerifiedOwner: agency?.is_verified_owner ?? false,
    whatsappNumber: agency?.whatsapp_number ?? null,
    images: (images ?? []).map((i) => i.url),
    lat: hotel.lat,
    lng: hotel.lng,
  };
});
