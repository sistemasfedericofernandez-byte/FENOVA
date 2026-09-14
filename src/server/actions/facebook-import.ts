"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import { fetchFacebookMarketplaceListing } from "@/server/services/facebook-import";
import cloudinary from "@/lib/cloudinary";

const urlSchema = z.string().url();

const MAX_IMAGES = 12;

/**
 * Importa una publicación de Facebook Marketplace: trae título, descripción,
 * precio y fotos, y sube las fotos a Cloudinary (quedan alojadas en nuestra
 * cuenta — las URLs de Facebook son firmadas y expiran, no se pueden guardar
 * tal cual en la base). Requiere estar logueado como agencia; el resultado
 * se usa para precargar el formulario de "Nueva propiedad", que sigue
 * siendo 100% editable antes de guardar.
 */
export async function importFromFacebookMarketplace(rawUrl: string) {
  const parsed = urlSchema.safeParse(rawUrl);
  if (!parsed.success) {
    return { ok: false as const, error: "Pegá un link válido." };
  }

  const supabase = await createClient();
  try {
    await requireAgencyId(supabase);
  } catch {
    return { ok: false as const, error: "No autenticado." };
  }

  let listing;
  try {
    listing = await fetchFacebookMarketplaceListing(parsed.data);
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "No se pudo leer la publicación de Facebook.",
    };
  }

  const imagesToUpload = listing.imageUrls.slice(0, MAX_IMAGES);
  const uploaded = await Promise.all(
    imagesToUpload.map(async (imageUrl) => {
      try {
        const result = await cloudinary.uploader.upload(imageUrl, { folder: "properties" });
        return { url: result.secure_url, publicId: result.public_id };
      } catch {
        return null;
      }
    }),
  );

  return {
    ok: true as const,
    data: {
      title: listing.title,
      description: listing.description ?? "",
      priceAmount: listing.priceAmount,
      priceCurrency: listing.priceCurrency,
      images: uploaded.filter((img): img is { url: string; publicId: string } => img !== null),
    },
  };
}
