"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId, slugify } from "@/server/services/agency";
import { canPublishHotel } from "@/server/services/subscriptions";

const AMENITY_VALUES = [
  "wifi",
  "pileta",
  "desayuno",
  "estacionamiento",
  "aire_acondicionado",
  "pet_friendly",
  "gimnasio",
  "restaurante",
] as const;

const hotelSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().max(4000).optional(),
  neighborhoodId: z.string().uuid().optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  pricePerNight: z.number().positive(),
  priceCurrency: z.enum(["ARS", "USD"]),
  totalRooms: z.number().int().positive().optional(),
  amenities: z.array(z.enum(AMENITY_VALUES)).default([]),
  status: z.enum(["borrador", "publicada"]).default("borrador"),
  images: z
    .array(z.object({ url: z.string().url(), publicId: z.string() }))
    .max(12)
    .default([]),
});

/**
 * Un hotel es 1:1 con la agencia (a diferencia de properties, donde una
 * agencia puede tener muchas). Esta acción crea el hotel si no existe, o
 * actualiza el existente — el formulario del dashboard siempre llama a esta
 * misma función.
 */
export async function upsertHotel(input: z.infer<typeof hotelSchema>) {
  const parsed = hotelSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  if (parsed.data.status === "publicada") {
    const check = await canPublishHotel(supabase, agencyId);
    if (!check.allowed) {
      return { ok: false as const, error: check.reason };
    }
  }

  const { data: existing } = await supabase
    .from("hotels")
    .select("id, slug")
    .eq("agency_id", agencyId)
    .maybeSingle();

  const basePayload = {
    name: parsed.data.name,
    description: parsed.data.description,
    neighborhood_id: parsed.data.neighborhoodId,
    star_rating: parsed.data.starRating,
    price_per_night: parsed.data.pricePerNight,
    price_currency: parsed.data.priceCurrency,
    total_rooms: parsed.data.totalRooms,
    amenities: parsed.data.amenities,
    status: parsed.data.status,
    published_at:
      parsed.data.status === "publicada" ? new Date().toISOString() : null,
  };

  let hotelId: string;
  let slug: string;

  if (existing) {
    const { error } = await supabase
      .from("hotels")
      .update(basePayload)
      .eq("id", existing.id);
    if (error) return { ok: false as const, error: error.message };
    hotelId = existing.id;
    slug = existing.slug;
  } else {
    slug = slugify(parsed.data.name);
    const { data, error } = await supabase
      .from("hotels")
      .insert({ ...basePayload, agency_id: agencyId, slug })
      .select("id, slug")
      .single();
    if (error) return { ok: false as const, error: error.message };
    hotelId = data.id;
    slug = data.slug;
  }

  if (parsed.data.images.length) {
    const { data: existingImages } = await supabase
      .from("hotel_images")
      .select("sort_order")
      .eq("hotel_id", hotelId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const startOrder = (existingImages?.[0]?.sort_order ?? -1) + 1;

    const { error: imagesError } = await supabase.from("hotel_images").insert(
      parsed.data.images.map((image, index) => ({
        hotel_id: hotelId,
        cloudinary_public_id: image.publicId,
        url: image.url,
        sort_order: startOrder + index,
      })),
    );
    if (imagesError) return { ok: false as const, error: imagesError.message };
  }

  return { ok: true as const, hotel: { id: hotelId, slug } };
}

export async function setHotelStatus(status: "borrador" | "publicada" | "oculta") {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  if (status === "publicada") {
    const check = await canPublishHotel(supabase, agencyId);
    if (!check.allowed) {
      return { ok: false as const, error: check.reason };
    }
  }

  const { error } = await supabase
    .from("hotels")
    .update({
      status,
      published_at: status === "publicada" ? new Date().toISOString() : null,
    })
    .eq("agency_id", agencyId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function removeHotelImage(imageId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("hotel_images").delete().eq("id", imageId);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
