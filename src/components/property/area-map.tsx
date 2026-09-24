"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

/**
 * Vista previa del mapa en el detalle de un aviso. Marca la zona con un
 * círculo (no con un pin exacto): alcanza para que quien mira sepa
 * "más o menos dónde queda" de un vistazo. Si el aviso todavía no tiene un
 * punto cargado por la inmobiliaria, el círculo es más grande (zona del barrio).
 */
export function AreaMap({
  lat,
  lng,
  approximate,
}: {
  lat: number;
  lng: number;
  approximate: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const radius = approximate ? 800 : 250;
      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      }).setView([lat, lng], approximate ? 14 : 15);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      L.circle([lat, lng], {
        radius,
        color: "#163a5c",
        weight: 2,
        fillColor: "#163a5c",
        fillOpacity: 0.18,
      }).addTo(map);

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, approximate]);

  return (
    <div className="isolate overflow-hidden rounded-2xl border border-zinc-300">
      <div ref={containerRef} className="h-64 w-full sm:h-72" role="img" aria-label="Mapa de la zona" />
    </div>
  );
}
