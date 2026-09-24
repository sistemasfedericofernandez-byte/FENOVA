"use server";

import { createClient } from "@/lib/supabase/server";

export type GeocodeResult = { lat: number; lng: number; label: string };

// Caja aproximada de Corrientes Capital (oeste, norte, este, sur).
const CORRIENTES_VIEWBOX = "-58.95,-27.38,-58.70,-27.58";

async function search(query: string, bounded: boolean): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "5",
    countrycodes: "ar",
    q: query,
  });
  if (bounded) {
    params.set("viewbox", CORRIENTES_VIEWBOX);
    params.set("bounded", "1");
  }

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { "User-Agent": "PropiMarket/1.0 (contacto@propimarket.com.ar)" },
    cache: "no-store",
  });
  if (!response.ok) return [];

  const data = (await response.json()) as { lat: string; lon: string; display_name: string }[];
  return data.map((item) => ({
    lat: Number(item.lat),
    lng: Number(item.lon),
    label: item.display_name.split(",").slice(0, 3).join(",").trim(),
  }));
}

/**
 * Busca una dirección para ubicarla en el mapa al cargar un aviso. Primero
 * dentro de Corrientes Capital; si no aparece, en todo el país. Solo para
 * cuentas logueadas (evita que se use como buscador público gratuito).
 */
export async function geocodeAddress(query: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "No autenticado" };

  const text = query.trim();
  if (text.length < 3) return { ok: true as const, results: [] as GeocodeResult[] };

  try {
    let results = await search(`${text}, Corrientes`, true);
    if (!results.length) results = await search(`${text}, Corrientes, Argentina`, false);
    return { ok: true as const, results };
  } catch {
    return { ok: false as const, error: "No se pudo buscar la dirección. Probá de nuevo." };
  }
}
