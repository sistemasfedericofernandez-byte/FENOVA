"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { canPublishMoreListings } from "@/server/services/subscriptions";
import { requireAgencyId, slugify } from "@/server/services/agency";
import { notifyMatchingAlerts } from "@/server/services/alerts";

const propertySchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(4000).optional(),
  operationType: z.enum(["venta", "alquiler", "alquiler_temporal"]),
  propertyType: z.enum([
    "casa",
    "departamento",
    "terreno",
    "local",
    "oficina",
    "galpon",
    "quinta",
    "otro",
  ]),
  neighborhoodId: z.string().uuid().optional(),
  priceAmount: z.number().positive(),
  priceCurrency: z.enum(["ARS", "USD"]),
  surfaceTotalM2: z.number().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  status: z.enum(["borrador", "publicada"]).default("borrador"),
  images: z
    .array(z.object({ url: z.string().url(), publicId: z.string() }))
    .max(12)
    .default([]),
});

export async function createProperty(input: z.infer<typeof propertySchema>) {
  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  if (parsed.data.status === "publicada") {
    const check = await canPublishMoreListings(supabase, agencyId);
    if (!check.allowed) {
      return { ok: false as const, error: check.reason };
    }
  }

  const { data, error } = await supabase
    .from("properties")
    .insert({
      agency_id: agencyId,
      title: parsed.data.title,
      slug: slugify(parsed.data.title),
      description: parsed.data.description,
      operation_type: parsed.data.operationType,
      property_type: parsed.data.propertyType,
      neighborhood_id: parsed.data.neighborhoodId,
      price_amount: parsed.data.priceAmount,
      price_currency: parsed.data.priceCurrency,
      surface_total_m2: parsed.data.surfaceTotalM2,
      bedrooms: parsed.data.bedrooms,
      bathrooms: parsed.data.bathrooms,
      status: parsed.data.status,
      published_at:
        parsed.data.status === "publicada" ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();

  if (error) {
    return { ok: false as const, error: error.message };
  }

  if (parsed.data.images.length) {
    const { error: imagesError } = await supabase.from("property_images").insert(
      parsed.data.images.map((image, index) => ({
        property_id: data.id,
        cloudinary_public_id: image.publicId,
        url: image.url,
        sort_order: index,
      })),
    );

    if (imagesError) {
      return { ok: false as const, error: imagesError.message };
    }
  }

  if (parsed.data.status === "publicada") {
    await notifyMatchingAlerts({
      id: data.id,
      slug: data.slug,
      title: parsed.data.title,
      operationType: parsed.data.operationType,
      propertyType: parsed.data.propertyType,
      neighborhoodId: parsed.data.neighborhoodId,
      priceAmount: parsed.data.priceAmount,
      priceCurrency: parsed.data.priceCurrency,
    });
  }

  return { ok: true as const, property: data };
}

const updatePropertySchema = propertySchema
  .omit({ status: true, images: true })
  .partial();

/**
 * Edita los campos de una propiedad existente. RLS (`properties_update_own_or_admin`)
 * ya garantiza que solo la agencia dueña (o un admin) pueda tocar la fila.
 */
export async function updateProperty(
  propertyId: string,
  input: z.infer<typeof updatePropertySchema>,
) {
  const parsed = updatePropertySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("properties")
    .update({
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
      description: parsed.data.description,
      operation_type: parsed.data.operationType,
      property_type: parsed.data.propertyType,
      neighborhood_id: parsed.data.neighborhoodId,
      price_amount: parsed.data.priceAmount,
      price_currency: parsed.data.priceCurrency,
      surface_total_m2: parsed.data.surfaceTotalM2,
      bedrooms: parsed.data.bedrooms,
      bathrooms: parsed.data.bathrooms,
    })
    .eq("id", propertyId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

/**
 * Cambia el estado de una propiedad. Pasar a "publicada" respeta el límite
 * de publicaciones activas del plan; pausar ("oculta") y volver a borrador
 * no tienen restricción.
 */
export async function setPropertyStatus(
  propertyId: string,
  status: "borrador" | "publicada" | "oculta",
) {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  if (status === "publicada") {
    const check = await canPublishMoreListings(supabase, agencyId);
    if (!check.allowed) {
      return { ok: false as const, error: check.reason };
    }
  }

  const { data, error } = await supabase
    .from("properties")
    .update({
      status,
      published_at: status === "publicada" ? new Date().toISOString() : null,
    })
    .eq("id", propertyId)
    .eq("agency_id", agencyId)
    .select(
      "id, slug, title, operation_type, property_type, neighborhood_id, price_amount, price_currency",
    )
    .single();

  if (error) return { ok: false as const, error: error.message };

  if (status === "publicada") {
    await notifyMatchingAlerts({
      id: data.id,
      slug: data.slug,
      title: data.title,
      operationType: data.operation_type,
      propertyType: data.property_type,
      neighborhoodId: data.neighborhood_id,
      priceAmount: data.price_amount,
      priceCurrency: data.price_currency,
    });
  }

  return { ok: true as const };
}

export async function deleteProperty(propertyId: string) {
  const supabase = await createClient();
  const agencyId = await requireAgencyId(supabase);

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("agency_id", agencyId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function addPropertyImages(
  propertyId: string,
  images: { url: string; publicId: string }[],
) {
  if (!images.length) return { ok: true as const };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("property_images")
    .select("sort_order")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const startOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("property_images").insert(
    images.map((image, index) => ({
      property_id: propertyId,
      cloudinary_public_id: image.publicId,
      url: image.url,
      sort_order: startOrder + index,
    })),
  );

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function removePropertyImage(imageId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("property_images")
    .delete()
    .eq("id", imageId);

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
