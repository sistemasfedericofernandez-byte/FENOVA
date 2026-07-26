import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { DisplayProperty } from "@/components/property/properties-explorer";

/**
 * Lecturas públicas de propiedades. Se hacen con el cliente "server" (anon
 * key), por lo que la RLS de `properties` ya filtra a solo `status =
 * 'publicada'` — no hace falta repetir ese filtro acá para estar seguros,
 * pero lo dejamos explícito por claridad y para aprovechar el índice.
 */
export async function getPublishedProperties(): Promise<DisplayProperty[]> {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select(
      "id, slug, title, price_amount, price_currency, operation_type, property_type, neighborhood_id, agency_id, created_at",
    )
    .eq("status", "publicada")
    .order("created_at", { ascending: false })
    // Tope de seguridad: el listado pagina client-side sobre este resultado.
    // Si el catálogo crece mucho más allá de esto, conviene mover la
    // paginación (y los filtros) al server con `range()`.
    .limit(300);

  if (!properties?.length) return [];

  const neighborhoodIds = [
    ...new Set(properties.map((p) => p.neighborhood_id).filter(Boolean)),
  ] as string[];
  const agencyIds = [...new Set(properties.map((p) => p.agency_id))];
  const propertyIds = properties.map((p) => p.id);

  const [{ data: neighborhoods }, { data: agencies }, { data: images }] =
    await Promise.all([
      neighborhoodIds.length
        ? supabase.from("neighborhoods").select("id, name").in("id", neighborhoodIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      supabase.from("agencies").select("id, is_verified_owner").in("id", agencyIds),
      supabase
        .from("property_images")
        .select("property_id, url, sort_order")
        .in("property_id", propertyIds)
        .order("sort_order", { ascending: true }),
    ]);

  const neighborhoodMap = new Map((neighborhoods ?? []).map((n) => [n.id, n.name]));
  const agencyMap = new Map(
    (agencies ?? []).map((a) => [a.id, a.is_verified_owner]),
  );
  const coverImageMap = new Map<string, string>();
  for (const image of images ?? []) {
    if (!coverImageMap.has(image.property_id)) {
      coverImageMap.set(image.property_id, image.url);
    }
  }

  return properties.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    neighborhoodName: p.neighborhood_id
      ? (neighborhoodMap.get(p.neighborhood_id) ?? null)
      : null,
    priceAmount: p.price_amount,
    priceCurrency: p.price_currency,
    operationType: p.operation_type,
    propertyType: p.property_type,
    isVerifiedOwner: agencyMap.get(p.agency_id) ?? false,
    coverImageUrl: coverImageMap.get(p.id) ?? null,
  }));
}

export async function getActiveNeighborhoodNames(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("neighborhoods")
    .select("name")
    .eq("active", true)
    .order("name");

  return (data ?? []).map((n) => n.name);
}

export type PublishedPropertyDetail = {
  id: string;
  title: string;
  description: string | null;
  operationType: string;
  priceAmount: number;
  priceCurrency: string;
  surfaceTotalM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  neighborhoodName: string | null;
  agencyName: string;
  isVerifiedOwner: boolean;
  whatsappNumber: string | null;
  images: string[];
};

export const getPublishedPropertyBySlug = cache(async function getPublishedPropertyBySlug(
  slug: string,
): Promise<PublishedPropertyDetail | null> {
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicada")
    .maybeSingle();

  if (!property) return null;

  const [{ data: neighborhood }, { data: agency }, { data: images }] =
    await Promise.all([
      property.neighborhood_id
        ? supabase
            .from("neighborhoods")
            .select("name")
            .eq("id", property.neighborhood_id)
            .maybeSingle()
        : Promise.resolve({ data: null as { name: string } | null }),
      supabase
        .from("agencies")
        .select("business_name, is_verified_owner, whatsapp_number")
        .eq("id", property.agency_id)
        .maybeSingle(),
      supabase
        .from("property_images")
        .select("url")
        .eq("property_id", property.id)
        .order("sort_order", { ascending: true }),
    ]);

  return {
    id: property.id,
    title: property.title,
    description: property.description,
    operationType: property.operation_type,
    priceAmount: property.price_amount,
    priceCurrency: property.price_currency,
    surfaceTotalM2: property.surface_total_m2,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    neighborhoodName: neighborhood?.name ?? null,
    agencyName: agency?.business_name ?? "Agencia",
    isVerifiedOwner: agency?.is_verified_owner ?? false,
    whatsappNumber: agency?.whatsapp_number ?? null,
    images: (images ?? []).map((i) => i.url),
  };
});
