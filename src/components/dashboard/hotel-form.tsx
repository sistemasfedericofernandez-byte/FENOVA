"use client";

import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { upsertHotel, removeHotelImage, setHotelStatus } from "@/server/actions/hotels";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import { AMENITY_OPTIONS } from "@/components/hotel/amenities";
import type { HotelAmenity, PriceCurrency } from "@/types/database.types";

export function HotelForm({
  neighborhoods,
  initialHotel,
  initialImages,
}: {
  neighborhoods: { id: string; name: string }[];
  initialHotel?: {
    name: string;
    description: string | null;
    neighborhood_id: string | null;
    star_rating: number | null;
    price_per_night: number;
    price_currency: PriceCurrency;
    total_rooms: number | null;
    amenities: HotelAmenity[];
    status: string;
  } | null;
  initialImages?: { id: string; url: string }[];
}) {
  const isPublished = initialHotel?.status === "publicada";
  const router = useRouter();
  const [name, setName] = useState(initialHotel?.name ?? "");
  const [description, setDescription] = useState(initialHotel?.description ?? "");
  const [neighborhoodId, setNeighborhoodId] = useState(
    initialHotel?.neighborhood_id ?? "",
  );
  const [starRating, setStarRating] = useState(
    initialHotel?.star_rating ? String(initialHotel.star_rating) : "",
  );
  const [pricePerNight, setPricePerNight] = useState(
    initialHotel ? String(initialHotel.price_per_night) : "",
  );
  const [priceCurrency, setPriceCurrency] = useState<PriceCurrency>(
    initialHotel?.price_currency ?? "ARS",
  );
  const [totalRooms, setTotalRooms] = useState(
    initialHotel?.total_rooms ? String(initialHotel.total_rooms) : "",
  );
  const [amenities, setAmenities] = useState<HotelAmenity[]>(
    initialHotel?.amenities ?? [],
  );
  const [images, setImages] = useState(initialImages ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleAmenity(value: HotelAmenity) {
    setAmenities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value],
    );
  }

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []).slice(0, 12));
  }

  async function handleRemoveImage(imageId: string) {
    setImages((prev) => prev.filter((i) => i.id !== imageId));
    await removeHotelImage(imageId);
  }

  async function handlePause() {
    setLoading(true);
    await setHotelStatus("oculta");
    router.refresh();
    setLoading(false);
  }

  async function handleSubmit(
    e: SyntheticEvent,
    status: "borrador" | "publicada",
  ) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const uploaded = [];
      for (const file of files) {
        uploaded.push(await uploadImageToCloudinary(file));
      }

      const result = await upsertHotel({
        name,
        description: description || undefined,
        neighborhoodId: neighborhoodId || undefined,
        starRating: starRating ? Number(starRating) : undefined,
        pricePerNight: Number(pricePerNight),
        priceCurrency,
        totalRooms: totalRooms ? Number(totalRooms) : undefined,
        amenities,
        status,
        images: uploaded,
      });

      if (!result.ok) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Revisá los datos del formulario",
        );
        setLoading(false);
        return;
      }

      router.push("/dashboard/hotel");
      router.refresh();
    } catch {
      setError("No se pudo guardar el hotel. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <form className="flex max-w-xl flex-col gap-3">
      <input
        type="text"
        required
        placeholder="Nombre del hotel (ej: Hotel Costanera)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />
      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="resize-none rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={neighborhoodId}
          onChange={(e) => setNeighborhoodId(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        >
          <option value="">Barrio (opcional)</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
        <select
          value={starRating}
          onChange={(e) => setStarRating(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        >
          <option value="">Categoría (opcional)</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} estrella{n === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <input
          type="number"
          required
          inputMode="decimal"
          placeholder="Precio / noche"
          value={pricePerNight}
          onChange={(e) => setPricePerNight(e.target.value)}
          className="col-span-2 rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <select
          value={priceCurrency}
          onChange={(e) => setPriceCurrency(e.target.value as PriceCurrency)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        >
          <option value="ARS">ARS</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <input
        type="number"
        inputMode="numeric"
        placeholder="Cantidad de habitaciones (opcional)"
        value={totalRooms}
        onChange={(e) => setTotalRooms(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Servicios</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AMENITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700"
            >
              <input
                type="checkbox"
                checked={amenities.includes(opt.value)}
                onChange={() => toggleAmenity(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {images.length > 0 ? (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Fotos actuales</span>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                <Image src={img.url} alt="" fill className="object-cover" sizes="100px" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        Agregar fotos (hasta 12)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
      </label>
      {files.length > 0 ? (
        <p className="text-xs text-zinc-500">
          {files.length} foto{files.length === 1 ? "" : "s"} seleccionada
          {files.length === 1 ? "" : "s"}
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={(e) => handleSubmit(e, "borrador")}
        >
          Guardar borrador
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={(e) => handleSubmit(e, "publicada")}
        >
          {loading ? "Guardando..." : "Publicar"}
        </Button>
        {isPublished ? (
          <Button type="button" variant="secondary" disabled={loading} onClick={handlePause}>
            Pausar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
