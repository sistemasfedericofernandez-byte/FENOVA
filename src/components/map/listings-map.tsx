"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { CORRIENTES_CENTER } from "@/lib/corrientes";
import { cn } from "@/lib/utils";
import type { MapListing } from "@/server/services/map-listings";

const FILTERS = [
  { key: "todo", label: "Todo" },
  { key: "venta", label: "Venta" },
  { key: "alquiler", label: "Alquiler" },
  { key: "alquiler_temporal", label: "Temporal" },
  { key: "hotel", label: "Hoteles" },
] as const;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function popupHtml(listing: MapListing) {
  const image = listing.coverImageUrl
    ? `<img src="${escapeHtml(listing.coverImageUrl)}" alt="" style="display:block;width:100%;height:128px;object-fit:cover" />`
    : `<div style="height:64px;background:#dfe7ee"></div>`;
  return `
    <a href="${escapeHtml(listing.href)}" style="display:block;text-decoration:none;color:#131b26">
      ${image}
      <div style="padding:12px 14px 14px">
        <div style="font-weight:700;font-size:16px;color:#0d2740">${escapeHtml(listing.priceLabel)}</div>
        <div style="font-weight:600;font-size:14px;margin-top:2px;line-height:1.3">${escapeHtml(listing.title)}</div>
        <div style="font-size:12px;color:#4b5563;margin-top:4px">${escapeHtml(listing.zone)}</div>
        <div style="margin-top:10px;font-size:13px;font-weight:700;color:#163a5c;text-decoration:underline">Ver aviso →</div>
      </div>
    </a>`;
}

export function ListingsMap({ listings }: { listings: MapListing[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("todo");

  const visible = useMemo(
    () => (filter === "todo" ? listings : listings.filter((l) => l.category === filter)),
    [listings, filter],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { todo: listings.length };
    for (const l of listings) result[l.category] = (result[l.category] ?? 0) + 1;
    return result;
  }, [listings]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, { scrollWheelZoom: true }).setView(
        [CORRIENTES_CENTER.lat, CORRIENTES_CENTER.lng],
        13,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !layerRef.current) return;
    const map = mapRef.current;
    const layer = layerRef.current;

    (async () => {
      const L = (await import("leaflet")).default;
      layer.clearLayers();

      for (const listing of visible) {
        const cls = cn(
          "pm-price",
          listing.kind === "hotel" && "pm-price-hotel",
          listing.approximate && "pm-price-approx",
        );
        const icon = L.divIcon({
          className: "pm-price-wrap",
          html: `<div class="${cls}">${escapeHtml(listing.priceLabel)}</div>`,
          iconSize: [0, 0],
        });
        const marker = L.marker([listing.lat, listing.lng], { icon, riseOnHover: true }).addTo(layer);
        marker.bindPopup(popupHtml(listing), { className: "pm-popup", maxWidth: 260, autoPanPadding: [20, 60] });
        marker.on("popupopen", () =>
          marker.getElement()?.querySelector(".pm-price")?.classList.add("pm-price-active"),
        );
        marker.on("popupclose", () =>
          marker.getElement()?.querySelector(".pm-price")?.classList.remove("pm-price-active"),
        );
      }

      if (visible.length) {
        map.fitBounds(L.latLngBounds(visible.map((l) => [l.lat, l.lng] as [number, number])), {
          padding: [60, 60],
          maxZoom: 15,
        });
      }
    })();
  }, [ready, visible]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              aria-pressed={active}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                active
                  ? "border-accent-strong bg-accent-strong text-white"
                  : "border-zinc-300 bg-white text-zinc-800 hover:border-accent-strong",
              )}
            >
              {item.label}
              <span className={cn("text-xs", active ? "text-white/80" : "text-zinc-600")}>
                {counts[item.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="isolate overflow-hidden rounded-2xl border border-zinc-300 shadow-sm">
        <div ref={containerRef} className="h-[62dvh] min-h-[420px] w-full" />
      </div>

      <p className="text-sm text-foreground/75">
        Tocá un precio para ver el aviso. Los precios con borde punteado indican una zona aproximada
        (la inmobiliaria todavía no marcó el punto exacto).
      </p>
    </div>
  );
}
