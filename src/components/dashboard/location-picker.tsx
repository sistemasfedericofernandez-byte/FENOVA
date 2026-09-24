"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { Button } from "@/components/ui/button";
import { CORRIENTES_CENTER } from "@/lib/corrientes";
import { geocodeAddress, type GeocodeResult } from "@/server/actions/geocoding";

type Point = { lat: number; lng: number };

export function LocationPicker({
  address,
  onAddressChange,
  value,
  onChange,
  fallbackCenter,
  neighborhoodName,
}: {
  /** Dirección escrita (calle y número): es la del aviso y también lo que se busca en el mapa. */
  address: string;
  onAddressChange: (address: string) => void;
  value: Point | null;
  onChange: (point: Point | null) => void;
  /** Dónde centrar el mapa mientras no hay un punto marcado (p. ej. el barrio elegido). */
  fallbackCenter?: Point | null;
  /** Barrio elegido en el formulario: afina la búsqueda de la dirección. */
  neighborhoodName?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const placeRef = useRef<((point: Point) => void) | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValue = useRef(value);
  const initialCenter = useRef(fallbackCenter);

  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [chosenLabel, setChosenLabel] = useState<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const start = initialValue.current ?? initialCenter.current ?? CORRIENTES_CENTER;
      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
        [start.lat, start.lng],
        initialValue.current ? 17 : 14,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const icon = L.divIcon({
        className: "pm-pin-wrap",
        html: '<div class="pm-pin"></div>',
        iconSize: [28, 36],
        iconAnchor: [14, 34],
      });

      const place = (point: Point) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([point.lat, point.lng]);
          return;
        }
        const marker = L.marker([point.lat, point.lng], { icon, draggable: true }).addTo(map);
        marker.on("dragend", () => {
          const { lat, lng } = marker.getLatLng();
          onChangeRef.current({ lat, lng });
        });
        markerRef.current = marker;
      };

      placeRef.current = place;
      if (initialValue.current) place(initialValue.current);

      map.on("click", (event) => {
        const point = { lat: event.latlng.lat, lng: event.latlng.lng };
        place(point);
        onChangeRef.current(point);
      });

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      placeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!value && fallbackCenter && mapRef.current) {
      mapRef.current.setView([fallbackCenter.lat, fallbackCenter.lng], 15);
    }
  }, [fallbackCenter, value]);

  async function handleSearch() {
    setMessage(null);
    setResults([]);
    setSearching(true);
    const response = await geocodeAddress(address, neighborhoodName);
    setSearching(false);

    if (!response.ok) {
      setMessage(response.error);
      return;
    }
    if (!response.results.length) {
      setMessage("No encontramos esa dirección. Probá con otra o tocá el mapa para marcar el punto.");
      return;
    }
    if (response.results.length === 1) {
      choose(response.results[0]);
      return;
    }
    setResults(response.results);
  }

  function choose(result: GeocodeResult) {
    const point = { lat: result.lat, lng: result.lng };
    placeRef.current?.(point);
    mapRef.current?.setView([point.lat, point.lng], 17);
    onChange(point);
    setChosenLabel(result.label);
    setResults([]);
    setMessage(null);
  }

  function clear() {
    markerRef.current?.remove();
    markerRef.current = null;
    setChosenLabel(null);
    onChange(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="Ej: San Martín 1200"
          aria-label="Dirección"
          className="field flex-1"
        />
        <Button type="button" variant="secondary" disabled={searching || address.trim().length < 3} onClick={handleSearch}>
          {searching ? "Buscando..." : "Buscar en el mapa"}
        </Button>
      </div>

      {results.length > 0 ? (
        <ul className="card divide-y divide-zinc-200 overflow-hidden">
          {results.map((result) => (
            <li key={`${result.lat}-${result.lng}`}>
              <button
                type="button"
                onClick={() => choose(result)}
                className="w-full px-4 py-3 text-left text-sm text-zinc-900 hover:bg-zinc-50"
              >
                {result.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {message ? <p className="text-sm font-medium text-red-700">{message}</p> : null}

      <div className="isolate overflow-hidden rounded-xl border border-zinc-300">
        <div ref={containerRef} className="h-72 w-full" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className={value ? "font-semibold text-emerald-800" : "text-zinc-700"}>
          {value
            ? chosenLabel
              ? `Ubicación marcada: ${chosenLabel}. Podés arrastrar el pin para ajustarla.`
              : "Ubicación marcada. Podés arrastrar el pin para ajustarla."
            : "Buscá la dirección o tocá el mapa para marcar el punto exacto."}
        </p>
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="font-semibold text-red-700 underline underline-offset-4"
          >
            Quitar ubicación
          </button>
        ) : null}
      </div>
    </div>
  );
}
