"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { goTo } from "@/lib/navigate";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { LocationPicker } from "@/components/dashboard/location-picker";
import { neighborhoodCenter } from "@/lib/corrientes";
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
  owners,
  initialImages,
}: {
  propertyId: string;
  initial: {
    title: string;
    description: string | null;
    operationType: OperationType;
    propertyType: PropertyType;
    neighborhoodId: string | null;
    ownerId: string | null;
    addressText: string | null;
    lat: number | null;
    lng: number | null;
    priceAmount: number;
    priceCurrency: PriceCurrency;
    surfaceTotalM2: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    status: string;
  };
  neighborhoods: { id: string; name: string }[];
  owners: { id: string; full_name: string }[];
  initialImages: ExistingImage[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [operationType, setOperationType] = useState(initial.operationType);
  const [propertyType, setPropertyType] = useState(initial.propertyType);
  const [neighborhoodId, setNeighborhoodId] = useState(initial.neighborhoodId ?? "");
  const [ownerId, setOwnerId] = useState(initial.ownerId ?? "");
  const [addressText, setAddressText] = useState(initial.addressText ?? "");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    initial.lat != null && initial.lng != null ? { lat: initial.lat, lng: initial.lng } : null,
  );
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
      ownerId: ownerId || undefined,
      addressText: addressText.trim() || null,
      lat: location ? location.lat : null,
      lng: location ? location.lng : null,
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

    goTo(router, "/dashboard/propiedades");
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <section className="card flex flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-[#0d2740]">
            {initial.status === "publicada" ? "Este aviso está publicado" : "Este aviso no está publicado"}
          </h2>
          <p className="text-sm text-zinc-700">
            {initial.status === "publicada"
              ? "Se ve en el sitio para cualquier persona. Podés pausarlo cuando quieras."
              : "Solo lo ves vos. Publicalo para que aparezca en el sitio."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {initial.status !== "publicada" ? (
            <Button disabled={saving} onClick={() => handleStatusChange("publicada")}>
              Publicar
            </Button>
          ) : (
            <Button variant="secondary" disabled={saving} onClick={() => handleStatusChange("oculta")}>
              Pausar (ocultar)
            </Button>
          )}
          <Button variant="danger" disabled={saving} onClick={handleDelete}>
            Eliminar propiedad
          </Button>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#0d2740]">Fotos</h2>
        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-zinc-200">
                <Image src={img.url} alt="" fill className="object-cover" sizes="150px" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  aria-label="Quitar foto"
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-sm text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-700">Todavía no tiene fotos.</p>
        )}
        <Field label="Agregar fotos" hint="Hasta 12 fotos. Se suben cuando guardás los cambios.">
          <input type="file" accept="image/*" multiple onChange={handleNewFilesChange} className="field" />
        </Field>
      </section>

      <section className="card flex flex-col gap-5 p-5 sm:p-6">
        <h2 className="text-base font-bold text-[#0d2740]">Datos del aviso</h2>

        <Field label="Título del aviso">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="field" />
        </Field>

        <Field label="Descripción">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="field resize-none"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="¿Qué querés hacer?">
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value as OperationType)}
              className="field"
            >
              {OPERATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo de propiedad">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="field"
            >
              {PROPERTY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Barrio">
            <select
              value={neighborhoodId}
              onChange={(e) => setNeighborhoodId(e.target.value)}
              className="field"
            >
              <option value="">Sin especificar</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Propietario" hint="Opcional. Es privado: solo lo ves vos.">
            <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className="field">
              <option value="">Sin propietario asignado</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.full_name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Dirección"
          hint="Es opcional y se muestra en el aviso. Si no querés mostrar el número exacto, poné solo la calle o la zona."
        >
          <input
            type="text"
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
            placeholder="Ej: San Martín 1200"
            className="field"
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-zinc-800">Ubicación en el mapa</span>
          <p className="text-xs leading-snug text-zinc-600">
            Marcá el punto exacto. Quien mire el aviso va a ver en el mapa la zona donde queda, sin
            necesidad de que le pases la dirección.
          </p>
          <LocationPicker
            value={location}
            onChange={setLocation}
            fallbackCenter={neighborhoodCenter(neighborhoods.find((n) => n.id === neighborhoodId)?.name)}
            neighborhoodName={neighborhoods.find((n) => n.id === neighborhoodId)?.name ?? null}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Precio">
            <input
              type="number"
              value={priceAmount}
              onChange={(e) => setPriceAmount(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Moneda">
            <select
              value={priceCurrency}
              onChange={(e) => setPriceCurrency(e.target.value as PriceCurrency)}
              className="field"
            >
              <option value="USD">Dólares (USD)</option>
              <option value="ARS">Pesos (ARS)</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Superficie (m²)">
            <input
              type="number"
              value={surfaceTotalM2}
              onChange={(e) => setSurfaceTotalM2(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Dormitorios">
            <input
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Baños">
            <input
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="field"
            />
          </Field>
        </div>

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        {statusMessage ? <p className="text-sm font-semibold text-emerald-700">{statusMessage}</p> : null}

        <div className="border-t border-zinc-200 pt-5">
          <Button disabled={saving} onClick={handleSave} className="w-full sm:w-auto">
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </section>
    </div>
  );
}
