import { NEIGHBORHOOD_CENTERS } from "@/lib/corrientes-barrios";

/**
 * Texto de la zona de un aviso. Se aclara "Barrio" y "Corrientes Capital" para
 * que no se confunda con localidades de la provincia que tienen el mismo nombre
 * (p. ej. la ciudad de Yapeyú, en el departamento San Martín).
 */
export function zoneLabel(neighborhoodName: string | null | undefined) {
  return neighborhoodName ? `Barrio ${neighborhoodName}, Corrientes Capital` : "Corrientes Capital";
}

/** Centro de Corrientes Capital: punto de arranque de todos los mapas. */
export const CORRIENTES_CENTER = { lat: -27.4692, lng: -58.8306 };

type LatLng = { lat: number; lng: number };

function normalize(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/cua\b/g, "cue")
    .trim();
}

export function neighborhoodCenter(name: string | null | undefined): LatLng | null {
  if (!name) return null;
  return NEIGHBORHOOD_CENTERS[normalize(name)] ?? null;
}

/**
 * Ubicación para mostrar de un aviso: la exacta si la inmobiliaria la cargó;
 * si no, la del barrio (aproximada). null si no hay forma de ubicarlo.
 */
export function resolveLocation(
  lat: number | null,
  lng: number | null,
  neighborhood: string | null | undefined,
): { lat: number; lng: number; approximate: boolean } | null {
  if (lat != null && lng != null) return { lat, lng, approximate: false };
  const center = neighborhoodCenter(neighborhood);
  return center ? { ...center, approximate: true } : null;
}
