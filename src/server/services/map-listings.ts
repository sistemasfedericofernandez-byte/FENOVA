import { createClient } from "@/lib/supabase/server";
import { resolveLocation } from "@/lib/corrientes";
import { formatArs } from "@/lib/utils";

export type MapListing = {
  id: string;
  kind: "property" | "hotel";
  /** "venta" | "alquiler" | "alquiler_temporal" | "hotel" — para los filtros. */
  category: string;
  href: string;
  title: string;
  priceLabel: string;
  zone: string;
  lat: number;
  lng: number;
  approximate: boolean;
  coverImageUrl: string | null;
};

/** Desplaza un punto aproximado unos metros (según el id) para que varios avisos del mismo barrio no queden apilados. */
function spread(id: string, lat: number, lng: number) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const meters = 120 + (Math.abs(hash >> 3) % 380);
  const dLat = (meters * Math.cos(angle)) / 111_000;
  const dLng = (meters * Math.sin(angle)) / (111_000 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lng + dLng };
}

const OPERATION_LABEL: Record<string, string> = {
  venta: "Venta",
  alquiler: "Alquiler",
  alquiler_temporal: "Alquiler temporal",
};

/** Todo lo publicado que se puede ubicar en el mapa (propiedades y hoteles). */
export async function getMapListings(): Promise<MapListing[]> {
  const supabase = await createClient();

  const [{ data: properties }, { data: hotels }, { data: neighborhoods }] = await Promise.all([
    supabase
      .from("properties")
      .select("id, slug, title, price_amount, price_currency, operation_type, neighborhood_id, lat, lng")
      .eq("status", "publicada")
      .limit(300),
    supabase
      .from("hotels")
      .select("id, slug, name, price_per_night, price_currency, neighborhood_id, lat, lng")
      .eq("status", "publicada")
      .limit(100),
    supabase.from("neighborhoods").select("id, name"),
  ]);

  const nameById = new Map((neighborhoods ?? []).map((n) => [n.id, n.name]));

  const propertyIds = (properties ?? []).map((p) => p.id);
  const hotelIds = (hotels ?? []).map((h) => h.id);
  const [{ data: propertyImages }, { data: hotelImages }] = await Promise.all([
    propertyIds.length
      ? supabase
          .from("property_images")
          .select("property_id, url, sort_order")
          .in("property_id", propertyIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as { property_id: string; url: string; sort_order: number }[] }),
    hotelIds.length
      ? supabase
          .from("hotel_images")
          .select("hotel_id, url, sort_order")
          .in("hotel_id", hotelIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as { hotel_id: string; url: string; sort_order: number }[] }),
  ]);

  const propertyCover = new Map<string, string>();
  for (const image of propertyImages ?? []) {
    if (!propertyCover.has(image.property_id)) propertyCover.set(image.property_id, image.url);
  }
  const hotelCover = new Map<string, string>();
  for (const image of hotelImages ?? []) {
    if (!hotelCover.has(image.hotel_id)) hotelCover.set(image.hotel_id, image.url);
  }

  const listings: MapListing[] = [];

  for (const p of properties ?? []) {
    const neighborhood = p.neighborhood_id ? (nameById.get(p.neighborhood_id) ?? null) : null;
    const location = resolveLocation(p.lat, p.lng, neighborhood);
    if (!location) continue;
    const point = location.approximate ? spread(p.id, location.lat, location.lng) : location;
    listings.push({
      id: p.id,
      kind: "property",
      category: p.operation_type,
      href: `/propiedades/${p.slug}`,
      title: p.title,
      priceLabel: formatArs(p.price_amount, p.price_currency),
      zone: `${OPERATION_LABEL[p.operation_type] ?? p.operation_type} · ${neighborhood ? `${neighborhood}, ` : ""}Corrientes`,
      lat: point.lat,
      lng: point.lng,
      approximate: location.approximate,
      coverImageUrl: propertyCover.get(p.id) ?? null,
    });
  }

  for (const h of hotels ?? []) {
    const neighborhood = h.neighborhood_id ? (nameById.get(h.neighborhood_id) ?? null) : null;
    const location = resolveLocation(h.lat, h.lng, neighborhood);
    if (!location) continue;
    const point = location.approximate ? spread(h.id, location.lat, location.lng) : location;
    listings.push({
      id: h.id,
      kind: "hotel",
      category: "hotel",
      href: `/hoteles/${h.slug}`,
      title: h.name,
      priceLabel: formatArs(h.price_per_night, h.price_currency),
      zone: `Hotel · ${neighborhood ? `${neighborhood}, ` : ""}Corrientes · por noche`,
      lat: point.lat,
      lng: point.lng,
      approximate: location.approximate,
      coverImageUrl: hotelCover.get(h.id) ?? null,
    });
  }

  return listings;
}
