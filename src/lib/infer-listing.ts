import type { OperationType, PropertyType } from "@/types/database.types";

function norm(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

/** Adivina si es venta o alquiler a partir del texto del aviso. Si no hay pistas, alquiler. */
export function inferOperation(text: string): OperationType {
  const n = norm(text);
  if (/alquiler temporal|temporario|por dia|por noche|turistic|amoblado por/.test(n)) {
    return "alquiler_temporal";
  }
  if (/alquil|locacion/.test(n)) return "alquiler";
  if (/\bvend|\bventa\b|escritura/.test(n)) return "venta";
  return "alquiler";
}

/** Adivina el tipo de propiedad. Si no hay pistas, "otro". */
export function inferType(text: string): PropertyType {
  const n = norm(text);
  if (/terreno|\blote\b|baldio/.test(n)) return "terreno";
  if (/galpon|deposito/.test(n)) return "galpon";
  if (/oficina/.test(n)) return "oficina";
  if (/\blocal\b|comercial/.test(n)) return "local";
  if (/quinta|chacra/.test(n)) return "quinta";
  if (/departamento|depto|dpto|monoambiente|loft|\bpiso\b/.test(n)) return "departamento";
  if (/\bcasa\b|chalet|vivienda|duplex/.test(n)) return "casa";
  return "otro";
}

// Nombres de barrio que también son palabras comunes: solo cuentan si el texto dice "barrio X".
const GENERIC_NEIGHBORHOODS = new Set([
  "centro",
  "libertad",
  "popular",
  "union",
  "progreso",
  "esperanza",
  "jardin",
  "industrial",
  "independencia",
  "belgrano",
  "universitario",
  "ponce",
  "aldana",
  "bancario",
]);

/** Busca en el texto el nombre de alguno de los barrios cargados. Devuelve el id (el nombre más largo gana). */
export function inferNeighborhoodId(
  text: string,
  neighborhoods: { id: string; name: string }[],
): string | null {
  const n = norm(text);
  let best: { id: string; length: number } | null = null;

  for (const neighborhood of neighborhoods) {
    const key = norm(neighborhood.name);
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = GENERIC_NEIGHBORHOODS.has(key)
      ? new RegExp(`(?:barrio|b°|bo\\.?)\\s+${escaped}(?![a-z0-9])`)
      : new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`);
    if (pattern.test(n) && (!best || key.length > best.length)) {
      best = { id: neighborhood.id, length: key.length };
    }
  }

  return best?.id ?? null;
}

function firstNumber(text: string, pattern: RegExp) {
  const match = norm(text).match(pattern);
  return match ? Number(match[1]) : undefined;
}

/** Datos numéricos que suelen venir en el texto ("3 dormitorios", "2 baños", "120 m2"). */
export function inferNumbers(text: string) {
  const bedrooms = firstNumber(text, /(\d{1,2})\s*(?:dormitorios?|dorm\b|habitaciones?|hab\b|cuartos?)/);
  const bathrooms = firstNumber(text, /(\d{1,2})\s*banos?/);
  const surface = firstNumber(text, /(\d{2,5})\s*(?:m2|m²|mts2?|metros)/);
  return {
    bedrooms: bedrooms != null && bedrooms <= 20 ? bedrooms : undefined,
    bathrooms: bathrooms != null && bathrooms <= 20 ? bathrooms : undefined,
    surfaceTotalM2: surface != null && surface > 0 ? surface : undefined,
  };
}
