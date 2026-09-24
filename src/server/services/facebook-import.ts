import type { PriceCurrency } from "@/types/database.types";
import { decodeMhtmlIfNeeded } from "@/server/services/mhtml";

export type FacebookListingData = {
  title: string;
  description: string | null;
  priceAmount: number | null;
  priceCurrency: PriceCurrency;
  imageUrls: string[];
};

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="128", "Google Chrome";v="128"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  Priority: "u=0, i",
};

/**
 * Facebook Marketplace no tiene API pública. Esto intenta leer el mismo
 * HTML que le serviría a un visitante sin sesión iniciada (headers de
 * navegador, sin browser headless). El problema: Meta bloquea el acceso
 * automático mucho más seguido desde IPs de servidores en la nube (como
 * las de Vercel) que desde una visita normal — por eso esta vía falla de
 * forma intermitente. Para importar de forma confiable, ver
 * `parseFacebookMarketplaceHtml`: la agencia guarda la página desde su
 * propio navegador (ya logueado y sin bloqueo) y sube ese archivo.
 */
export async function fetchFacebookMarketplaceListing(
  url: string,
): Promise<FacebookListingData> {
  const parsed = new URL(url);
  if (
    !/(^|\.)facebook\.com$/.test(parsed.hostname) ||
    !parsed.pathname.includes("/marketplace/item/")
  ) {
    throw new Error("El link no parece ser de un artículo de Facebook Marketplace.");
  }

  const response = await fetch(url, { headers: BROWSER_HEADERS });
  if (!response.ok) {
    throw new Error(`Facebook devolvió un error (${response.status}). Probá de nuevo en un rato.`);
  }
  const html = await response.text();
  return parseFacebookMarketplaceHtml(html);
}

/**
 * Parsea el HTML de una publicación de Facebook Marketplace (venga de un
 * fetch en vivo o de un archivo guardado por el usuario) y saca título,
 * precio, descripción y fotos. Los datos completos vienen embebidos en
 * bloques `<script type="application/json">` que React usa para hidratar
 * la página — se buscan por forma/clave de los datos, no por índice fijo,
 * porque la posición de esos bloques varía entre publicaciones.
 *
 * Es inherentemente frágil ante cambios internos de Facebook. Por eso
 * siempre se cae de vuelta a las meta tags og:* (más estables) cuando el
 * bloque JSON no aparece.
 */
export function parseFacebookMarketplaceHtml(rawHtml: string): FacebookListingData {
  const html = decodeMhtmlIfNeeded(rawHtml);
  const ogTitle = extractMeta(html, "og:title");
  const ogDescription = extractMeta(html, "og:description");
  const ogImage = extractMeta(html, "og:image");

  const jsonBlocks = extractJsonBlocks(html);

  const detail = findDetailBlock(jsonBlocks);
  const images = findImageArray(jsonBlocks);

  const title = detail?.title ?? ogTitle;
  const imageUrls = images.length > 0 ? images : ogImage ? [decodeHtmlEntities(ogImage)] : [];

  // Si no se pudo sacar ni el título ni ninguna foto, o esto no era HTML
  // de una publicación de Marketplace, mejor avisar con un error claro
  // que devolver un formulario vacío como si hubiese funcionado.
  if (!title && imageUrls.length === 0) {
    throw new Error(
      "No se pudieron sacar los datos de esa publicación. Si pegaste un link, probá guardando la página y subiendo el archivo en su lugar.",
    );
  }

  return {
    title: title ?? "Propiedad importada de Facebook",
    description: detail?.description ?? ogDescription ?? null,
    priceAmount: detail?.priceAmount ?? null,
    priceCurrency: detail?.priceCurrency ?? "ARS",
    imageUrls,
  };
}

function extractMeta(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta property="${property}"[^>]*content="([^"]*)"`,
  );
  const match = html.match(re);
  return match ? decodeHtmlEntities(match[1]) : null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractJsonBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch {
      // Bloques no parseables (o que no son relevantes) se ignoran.
    }
  }
  return blocks;
}

/** Busca recursivamente todas las ocurrencias de una clave dada. */
function findAllByKey(obj: unknown, key: string, results: unknown[], depth = 0) {
  if (depth > 40 || obj === null || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    for (const item of obj) findAllByKey(item, key, results, depth + 1);
    return;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (k === key) results.push(v);
    findAllByKey(v, key, results, depth + 1);
  }
}

/**
 * El bloque de "detalle" de la publicación es el único que trae
 * `redacted_description` junto con el título y el precio — los bloques de
 * "sugerencias" (otras publicaciones) no lo tienen.
 */
function findDetailBlock(blocks: unknown[]): {
  title: string | null;
  description: string | null;
  priceAmount: number | null;
  priceCurrency: PriceCurrency;
} | null {
  for (const block of blocks) {
    const descriptions: unknown[] = [];
    findAllByKey(block, "redacted_description", descriptions);
    const desc = descriptions.find(
      (d): d is { text: string } =>
        typeof d === "object" && d !== null && typeof (d as { text?: unknown }).text === "string",
    );
    if (!desc) continue;

    const titles: unknown[] = [];
    findAllByKey(block, "marketplace_listing_title", titles);
    const title = titles.find((t): t is string => typeof t === "string") ?? null;

    const prices: unknown[] = [];
    findAllByKey(block, "listing_price", prices);
    const price = prices.find(
      (p): p is { amount: string; currency?: string } =>
        typeof p === "object" && p !== null && typeof (p as { amount?: unknown }).amount === "string",
    );

    return {
      title,
      description: desc.text,
      priceAmount: price ? Number(price.amount) : null,
      priceCurrency: price?.currency === "USD" ? "USD" : "ARS",
    };
  }
  return null;
}

/**
 * El carrusel de fotos de la publicación viaja en `listing_photos`, un
 * array de `{ image: { uri, width, height } }`. Si esa clave no aparece
 * (Facebook cambió algo), como respaldo se buscan arrays genéricos de
 * objetos `{ uri, width, height }` de al menos 2 elementos.
 */
function findImageArray(blocks: unknown[]): string[] {
  for (const block of blocks) {
    const photoArrays: unknown[] = [];
    findAllByKey(block, "listing_photos", photoArrays);
    for (const arr of photoArrays) {
      if (!Array.isArray(arr) || arr.length === 0) continue;
      const uris = arr
        .map((item) => {
          const image = (item as { image?: unknown } | null)?.image;
          return isImageRef(image) ? image.uri : null;
        })
        .filter((uri): uri is string => uri !== null);
      if (uris.length > 0) return uris;
    }
  }

  for (const block of blocks) {
    const arrays: unknown[] = [];
    collectImageArrays(block, arrays);
    const best = arrays.find(
      (arr): arr is { uri: string; width: number; height: number }[] =>
        Array.isArray(arr) && arr.length >= 2 && arr.every(isImageRef),
    );
    if (best) return best.map((img) => img.uri);
  }
  return [];
}

function isImageRef(value: unknown): value is { uri: string; width: number; height: number } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.uri === "string" && typeof v.width === "number" && typeof v.height === "number";
}

function collectImageArrays(obj: unknown, results: unknown[], depth = 0) {
  if (depth > 40 || obj === null || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    results.push(obj);
    for (const item of obj) collectImageArrays(item, results, depth + 1);
    return;
  }
  for (const v of Object.values(obj as Record<string, unknown>)) {
    collectImageArrays(v, results, depth + 1);
  }
}
