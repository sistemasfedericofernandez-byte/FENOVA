"use server";

import { createClient } from "@/lib/supabase/server";

export type GeocodeResult = { lat: number; lng: number; label: string };

// Caja aproximada de Corrientes Capital (oeste, norte, este, sur).
const CORRIENTES_VIEWBOX = "-58.95,-27.38,-58.70,-27.58";

type NominatimItem = {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
};

/** "Mirasol 3029 · Barrio Yapeyú": calle y número, más el barrio que devuelve el mapa. */
function buildLabel(item: NominatimItem) {
  const a = item.address ?? {};
  const street = [a.road, a.house_number].filter(Boolean).join(" ");
  const zone = a.suburb ?? a.neighbourhood ?? a.city_district ?? a.quarter;
  const zoneText = zone
    ? /^seccional/i.test(zone)
      ? zone
      : `Barrio ${zone.replace(/^Barrio\s+/i, "")}`
    : null;
  const parts = [street, zoneText].filter(Boolean);
  return parts.length ? parts.join(" · ") : item.display_name.split(",").slice(0, 3).join(",").trim();
}

async function search(query: string, bounded: boolean): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "5",
    countrycodes: "ar",
    addressdetails: "1",
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

  const data = (await response.json()) as NominatimItem[];
  return data.map((item) => ({
    lat: Number(item.lat),
    lng: Number(item.lon),
    label: buildLabel(item),
  }));
}

/**
 * Busca una dirección para ubicarla en el mapa al cargar un aviso. Siempre
 * dentro de Corrientes Capital (con el barrio elegido primero, para afinar);
 * solo si no aparece nada se busca en el resto del país. Cada resultado
 * muestra su barrio para que la persona pueda comprobar que es el lugar
 * correcto. Solo para cuentas logueadas.
 */
export async function geocodeAddress(query: string, neighborhood?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "No autenticado" };

  const text = query.trim();
  if (text.length < 3) return { ok: true as const, results: [] as GeocodeResult[] };

  try {
    const found: GeocodeResult[] = [];
    const add = (items: GeocodeResult[]) => {
      for (const item of items) {
        const duplicated = found.some(
          (f) =>
            f.label === item.label ||
            (Math.abs(f.lat - item.lat) < 0.0002 && Math.abs(f.lng - item.lng) < 0.0002),
        );
        if (!duplicated) found.push(item);
      }
    };

    if (neighborhood) add(await search(`${text}, ${neighborhood}, Corrientes Capital`, true));
    add(await search(`${text}, Corrientes Capital`, true));
    if (!found.length) add(await search(`${text}, Corrientes, Argentina`, false));

    return { ok: true as const, results: found.slice(0, 5) };
  } catch {
    return { ok: false as const, error: "No se pudo buscar la dirección. Probá de nuevo." };
  }
}
