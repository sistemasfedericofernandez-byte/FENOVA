"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  updateProperty,
  setPropertyStatus,
  deleteProperty,
  addPropertyImages,
  removePropertyImage,
} from "@/server/actions/properties";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import type {
  OperationType,
  PropertyType,
  PriceCurrency,
} from "@/types/database.types";

const OPERATION_OPTIONS: { value: OperationType; label: string }[] = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "alquiler_temporal", label: "Alquiler temporal" },
];

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "casa", label: "Casa" },
  { value: "departamento", label: "Departamento" },
  { value: "terreno", label: "Terreno" },
  { value: "local", label: "Local" },
  { value: "oficina", label: "Oficina" },
  { value: "galpon", label: "Galpón" },
  { value: "quinta", label: "Quinta" },
  { value: "otro", label: "Otro" },
];

type ExistingImage = { id: string; url: string };

export function EditPropertyForm({
  propertyId,
  initial,
  neighborhoods,
  initialImages,
}: {
  propertyId: string;
  initial: {
    title: string;
    description: string | null;
    operationType: OperationType;
    propertyType: PropertyType;
    neighborhoodId: string | null;
    priceAmount: number;
    priceCurrency: PriceCurrency;
    surfaceTotalM2: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    status: string;
  };
  neighborhoods: { id: string; name: string }[];
  initialImages: ExistingImage[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [operationType, setOperationType] = useState(initial.operationType);
  const [propertyType, setPropertyType] = useState(initial.propertyType);
  const [neighborhoodId, setNeighborhoodId] = useState(initial.neighborhoodId ?? "");
  const [priceAmount, setPriceAmount] = useState(String(initial.priceAmount));
  const [priceCurrency, setPriceCurrency] = useState(initial.priceCurrency);
  const [surfaceTotalM2, setSurfaceTotalM2] = useState(
    initial.surfaceTotalM2 ? String(initial.surfaceTotalM2) : "",
  );
  const [bedrooms, setBedrooms] = useState(
    initial.bedrooms ? String(initial.bedrooms) : "",
  );
  const [bathrooms, setBathrooms] = useState(
    initial.bathrooms ? String(initial.bathrooms) : "",
  );
  const [images, setImages] = useState<ExistingImage[]>(initialImages);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function handleNewFilesChange(e: ChangeEvent<HTMLInputElement>) {
    setNewFiles(Array.from(e.target.files ?? []).slice(0, 12));
  }

  async function handleRemoveImage(imageId: string) {
    setImages((prev) => prev.filter((i) => i.id !== imageId));
    await removePropertyImage(imageId);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setStatusMessage(null);

    const updateResult = await updateProperty(propertyId, {
      title,
      description: description || undefined,
      operationType,
      propertyType,
      neighborhoodId: neighborhoodId || undefined,
      priceAmount: Number(priceAmount),
      priceCurrency,
      surfaceTotalM2: surfaceTotalM2 ? Number(surfaceTotalM2) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
    });

    if (!updateResult.ok) {
      setSaving(false);
      setError(
        typeof updateResult.error === "string"
          ? updateResult.error
          : "Revisá los datos del formulario",
      );
      return;
    }

    if (newFiles.length) {
      const uploaded = [];
      for (const file of newFiles) {
        uploaded.push(await uploadImageToCloudinary(file));
      }
      await addPropertyImages(propertyId, uploaded);
    }

    setSaving(false);
    setStatusMessage("Cambios guardados.");
    setNewFiles([]);
    router.refresh();
  }

  async function handleStatusChange(status: "borrador" | "publicada" | "oculta") {
    setSaving(true);
    setError(null);
    const result = await setPropertyStatus(propertyId, status);
    setSaving(false);

    if (!result.ok) {
      setError(typeof result.error === "string" ? result.error : "No se pudo cambiar el estado");
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta propiedad? Esta acción no se puede deshacer.")) {
      return;
    }
    setSaving(true);
    const result = await deleteProperty(propertyId);
    setSaving(false);

    if (!result.ok) {
      setError(typeof result.error === "string" ? result.error : "No se pudo eliminar");
      return;
    }

    router.push("/dashboard/propiedades");
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {initial.status !== "publicada" ? (
          <Button
            variant="secondary"
            disabled={saving}
            onClick={() => handleStatusChange("publicada")}
          >
            Publicar
          </Button>
        ) : (
          <Button
            variant="secondary"
            disabled={saving}
            onClick={() => handleStatusChange("oculta")}
          >
            Pausar (ocultar)
          </Button>
        )}
        <Button variant="ghost" disabled={saving} onClick={handleDelete}>
          Eliminar propiedad
        </Button>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg">
              <Image src={img.url} alt="" fill className="object-cover" sizes="150px" />
              <button
                type="button"
                onClick={() => handleRemoveImage(img.id)}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        Agregar fotos
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleNewFilesChange}
          className="rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
      </label>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="resize-none rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={operationType}
          onChange={(e) => setOperationType(e.target.value as OperationType)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        >
          {OPERATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value as PropertyType)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        >
          {PROPERTY_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

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

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          value={priceAmount}
          onChange={(e) => setPriceAmount(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <select
          value={priceCurrency}
          onChange={(e) => setPriceCurrency(e.target.value as PriceCurrency)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        >
          <option value="USD">USD</option>
          <option value="ARS">ARS</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <input
          type="number"
          placeholder="Superficie m²"
          value={surfaceTotalM2}
          onChange={(e) => setSurfaceTotalM2(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <input
          type="number"
          placeholder="Dormitorios"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <input
          type="number"
          placeholder="Baños"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {statusMessage ? <p className="text-sm text-emerald-600">{statusMessage}</p> : null}

      <Button disabled={saving} onClick={handleSave}>
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}
