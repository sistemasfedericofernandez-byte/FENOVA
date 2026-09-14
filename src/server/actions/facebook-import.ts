"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAgencyId } from "@/server/services/agency";
import {
  fetchFacebookMarketplaceListing,
  parseFacebookMarketplaceHtml,
  type FacebookListingData,
} from "@/server/services/facebook-import";
import cloudinary from "@/lib/cloudinary";

const urlSchema = z.string().url();
const MAX_IMAGES = 12;
const MAX_HTML_LENGTH = 20_000_000; // ~20MB, de sobra para una página guardada

/**
 * Sube las fotos importadas a Cloudinary (quedan alojadas en nuestra cuenta
 * — las URLs de Facebook son firmadas y expiran, no se pueden guardar tal
 * cual en la base) y arma la respuesta que precarga el formulario de
 * "Nueva propiedad" (100% editable antes de guardar).
 */
async function buildImportResult(listing: FacebookListingData) {
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

async function requireAgencyOrError() {
  const supabase = await createClient();
  try {
    await requireAgencyId(supabase);
    return null;
  } catch {
    return { ok: false as const, error: "No autenticado." };
  }
}

/**
 * Importa pegando el link. Falla seguido: Facebook bloquea el acceso
 * automático mucho más desde IPs de servidores en la nube que desde una
 * visita normal. Cuando falla, sugerir `importFromFacebookHtml` (guardar
 * la página y subirla), que es 100% confiable.
 */
export async function importFromFacebookMarketplace(rawUrl: string) {
  const parsed = urlSchema.safeParse(rawUrl);
  if (!parsed.success) {
    return { ok: false as const, error: "Pegá un link válido." };
  }

  const authError = await requireAgencyOrError();
  if (authError) return authError;

  let listing: FacebookListingData;
  try {
    listing = await fetchFacebookMarketplaceListing(parsed.data);
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "No se pudo leer la publicación de Facebook.",
    };
  }

  return buildImportResult(listing);
}

/**
 * Importa a partir del HTML de la publicación guardado por el propio
 * usuario (Ctrl+S / "Guardar como" → "Página web, solo HTML" en su
 * navegador, estando en la publicación de Facebook). Como el HTML ya se lo
 * sirvió Facebook al navegador de la persona —no a un servidor nuestro—
 * nunca hay bloqueo: es la vía confiable.
 */
export async function importFromFacebookHtml(html: string) {
  if (typeof html !== "string" || html.trim().length === 0) {
    return { ok: false as const, error: "El archivo está vacío." };
  }
  if (html.length > MAX_HTML_LENGTH) {
    return { ok: false as const, error: "El archivo es demasiado grande." };
  }

  const authError = await requireAgencyOrError();
  if (authError) return authError;

  let listing: FacebookListingData;
  try {
    listing = parseFacebookMarketplaceHtml(html);
  } catch (err) {
    return {
      ok: false as const,
      error:
        err instanceof Error
          ? err.message
          : "No se pudieron sacar los datos de ese archivo.",
    };
  }

  return buildImportResult(listing);
}
