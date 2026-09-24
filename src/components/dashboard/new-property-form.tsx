"use client";

import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { LocationPicker } from "@/components/dashboard/location-picker";
import { neighborhoodCenter } from "@/lib/corrientes";
import { createProperty } from "@/server/actions/properties";
import {
  importFromFacebookMarketplace,
  importFromFacebookHtml,
} from "@/server/actions/facebook-import";
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

type ImportedImage = { url: string; publicId: string };

export function NewPropertyForm({
  neighborhoods,
  owners,
}: {
  neighborhoods: { id: string; name: string }[];
  owners: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [operationType, setOperationType] = useState<OperationType>("venta");
  const [propertyType, setPropertyType] = useState<PropertyType>("casa");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [addressText, setAddressText] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [priceAmount, setPriceAmount] = useState("");
  const [priceCurrency, setPriceCurrency] = useState<PriceCurrency>("USD");
  const [surfaceTotalM2, setSurfaceTotalM2] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [importedImages, setImportedImages] = useState<ImportedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [facebookUrl, setFacebookUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []).slice(0, 12 - importedImages.length));
  }

  function handleRemoveImported(publicId: string) {
    setImportedImages((prev) => prev.filter((img) => img.publicId !== publicId));
  }

  function applyImportResult(data: {
    title: string;
    description: string;
    priceAmount: number | null;
    priceCurrency: PriceCurrency;
    images: ImportedImage[];
  }) {
    setTitle(data.title);
    setDescription(data.description);
    if (data.priceAmount != null) {
      setPriceAmount(String(data.priceAmount));
      setPriceCurrency(data.priceCurrency);
    }
    setImportedImages(data.images);
  }

  async function handleImportFromFacebook() {
    setImportError(null);
    setImporting(true);
    try {
      const result = await importFromFacebookMarketplace(facebookUrl);
      if (!result.ok) {
        setImportError(result.error);
        return;
      }
      applyImportResult(result.data);
    } catch {
      setImportError("No se pudo importar la publicación. Revisá el link e intentá de nuevo.");
    } finally {
      setImporting(false);
    }
  }

  async function handleImportFromHtmlFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImportError(null);
    setImporting(true);
    try {
      const html = await file.text();
      const result = await importFromFacebookHtml(html);
      if (!result.ok) {
        setImportError(result.error);
        return;
      }
      applyImportResult(result.data);
    } catch {
      setImportError("No se pudo leer ese archivo. Asegurate de subir el HTML guardado desde el navegador.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSubmit(
    e: SyntheticEvent,
    status: "borrador" | "publicada",
  ) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const uploadedFromFiles = [];
      for (const file of files) {
        uploadedFromFiles.push(await uploadImageToCloudinary(file));
      }
      const images = [...importedImages, ...uploadedFromFiles];

      const result = await createProperty({
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
        status,
        images,
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

      router.push("/dashboard/propiedades");
      router.refresh();
    } catch {
      setError("No se pudo guardar la propiedad. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <section className="card flex flex-col gap-4 border-dashed p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold text-[#0d2740]">
            ¿Ya la tenés publicada en Facebook Marketplace?
          </h2>
          <p className="text-sm text-zinc-700">
            Importala y completamos título, descripción, precio y fotos por vos. Después podés
            corregir lo que quieras antes de guardar.
          </p>
        </div>

        <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-800">
          <li>Abrí tu publicación en Facebook, en tu propio navegador.</li>
          <li>
            Apretá Ctrl+S (o menú → &quot;Guardar página como&quot;) y elegí{" "}
            <strong>&quot;Página web, solo HTML&quot;</strong>.
          </li>
          <li>Subí acá ese archivo .html.</li>
        </ol>

        <input
          type="file"
          accept=".html,.htm,text/html"
          disabled={importing}
          onChange={handleImportFromHtmlFile}
          aria-label="Archivo HTML de la publicación de Facebook"
          className="field"
        />

        <details className="text-sm text-zinc-800">
          <summary className="cursor-pointer font-semibold">O probá pegando el link directo</summary>
          <p className="mt-2 text-zinc-700">
            Es más rápido, pero Facebook a veces lo bloquea. Si falla, usá el archivo de arriba.
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              placeholder="https://www.facebook.com/marketplace/item/..."
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              aria-label="Link de la publicación de Facebook"
              className="field flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={importing || !facebookUrl}
              onClick={handleImportFromFacebook}
            >
              {importing ? "Importando..." : "Importar"}
            </Button>
          </div>
        </details>

        {importing ? <p className="text-sm text-zinc-700">Importando, un momento…</p> : null}
        {importError ? <p className="text-sm font-medium text-red-700">{importError}</p> : null}
      </section>

      <form className="card flex flex-col gap-5 p-5 sm:p-6">
        <Field label="Título del aviso">
          <input
            type="text"
            required
            placeholder="Ej: Casa 3 dormitorios en Cambá Cué"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
          />
        </Field>

        <Field label="Descripción" hint="Contá lo más importante: ambientes, estado, servicios, cercanías.">
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
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Precio">
            <input
              type="number"
              required
              inputMode="decimal"
              placeholder="0"
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
              inputMode="decimal"
              value={surfaceTotalM2}
              onChange={(e) => setSurfaceTotalM2(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Dormitorios">
            <input
              type="number"
              inputMode="numeric"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Baños">
            <input
              type="number"
              inputMode="numeric"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="field"
            />
          </Field>
        </div>

        {importedImages.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-zinc-800">Fotos importadas de Facebook</span>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {importedImages.map((img) => (
                <div
                  key={img.publicId}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-200"
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="120px" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImported(img.publicId)}
                    aria-label="Quitar foto"
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-sm text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <Field
          label={importedImages.length > 0 ? "Agregar más fotos" : "Fotos"}
          hint="Hasta 12 fotos. La primera es la que se ve en el listado."
        >
          <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="field" />
        </Field>
        {files.length > 0 ? (
          <p className="-mt-3 text-sm text-zinc-700">
            {files.length} foto{files.length === 1 ? "" : "s"} seleccionada
            {files.length === 1 ? "" : "s"}
          </p>
        ) : null}

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

        <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row">
          <Button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, "publicada")}
            className="sm:flex-1"
          >
            {loading ? "Guardando..." : "Publicar ahora"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={(e) => handleSubmit(e, "borrador")}
            className="sm:flex-1"
          >
            Guardar como borrador
          </Button>
        </div>
      </form>
    </div>
  );
}
