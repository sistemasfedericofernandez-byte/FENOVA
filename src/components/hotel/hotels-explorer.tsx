"use client";

import { useMemo, useState } from "react";
import { HotelCard } from "@/components/hotel/hotel-card";
import type { DisplayHotel } from "@/server/services/public-hotels";

const PAGE_SIZE = 12;

export function HotelsExplorer({
  hotels,
  neighborhoods,
}: {
  hotels: DisplayHotel[];
  neighborhoods: string[];
}) {
  const [neighborhood, setNeighborhood] = useState<string>("todos");
  const [priceMax, setPriceMax] = useState<string>("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return hotels.filter((h) => {
      if (neighborhood !== "todos" && h.neighborhoodName !== neighborhood)
        return false;
      if (priceMax && h.pricePerNight > Number(priceMax)) return false;
      return true;
    });
  }, [hotels, neighborhood, priceMax]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function updateFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Hoteles en Corrientes</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={neighborhood}
          onChange={(e) => updateFilter(setNeighborhood)(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        >
          <option value="todos">Todos los barrios</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <input
          type="number"
          inputMode="numeric"
          placeholder="Precio máximo por noche"
          value={priceMax}
          onChange={(e) => updateFilter(setPriceMax)(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            No encontramos hoteles con esos filtros.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((h) => (
              <HotelCard
                key={h.id}
                slug={h.slug}
                name={h.name}
                neighborhoodName={h.neighborhoodName}
                pricePerNight={h.pricePerNight}
                priceCurrency={h.priceCurrency}
                starRating={h.starRating}
                amenities={h.amenities}
                coverImageUrl={h.coverImageUrl}
                isVerifiedOwner={h.isVerifiedOwner}
                imageCount={h.imageCount}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="min-h-11 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
              >
                Anterior
              </button>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="min-h-11 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-zinc-700"
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
