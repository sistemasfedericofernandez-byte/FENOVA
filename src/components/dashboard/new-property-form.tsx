"use client";

import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
}: {
  neighborhoods: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [operationType, setOperationType] = useState<OperationType>("venta");
  const [propertyType, setPropertyType] = useState<PropertyType>("casa");
  const [neighborhoodId, setNeighborhoodId] = useState("");
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
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Importar desde Facebook Marketplace
          </label>
          <p className="text-xs text-zinc-500">
            Completamos título, descripción, precio y fotos automáticamente
            — después podés editar todo antes de guardar.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Opción recomendada — 100% confiable
          </span>
          <ol className="list-decimal pl-4 text-xs text-zinc-500">
            <li>Abrí tu publicación en Facebook, en tu propio navegador.</li>
            <li>
              Ctrl+S (o menú → &quot;Guardar página como&quot;) y elegí{" "}
              <strong>&quot;Página web, solo HTML&quot;</strong>.
            </li>
            <li>Subí acá ese archivo .html.</li>
          </ol>
          <label className="flex flex-col gap-1 text-sm">
            <input
              type="file"
              accept=".html,.htm,text/html"
              disabled={importing}
              onChange={handleImportFromHtmlFile}
              className="rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
            />
          </label>
        </div>

        <details className="text-xs text-zinc-500">
          <summary className="cursor-pointer font-medium">
            O probá pegando el link directo
          </summary>
          <p className="mt-1">
            Más rápido, pero Facebook a veces bloquea este método (bloquea
            más seguido a los servidores que a una visita normal) — si
            falla, usá la opción de arriba.
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              placeholder="https://www.facebook.com/marketplace/item/..."
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
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

        {importing ? (
          <p className="text-sm text-zinc-500">Importando, un momento…</p>
        ) : null}
        {importError ? <p className="text-sm text-red-600">{importError}</p> : null}
      </div>

      <form className="flex flex-col gap-3">
        <input
          type="text"
          required
          placeholder="Título (ej: Casa 3 dormitorios en Cambá Cué)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
            required
            inputMode="decimal"
            placeholder="Precio"
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
            inputMode="decimal"
            placeholder="Superficie m²"
            value={surfaceTotalM2}
            onChange={(e) => setSurfaceTotalM2(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Dormitorios"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Baños"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          />
        </div>

        {importedImages.length > 0 ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Fotos importadas de Facebook</span>
            <div className="grid grid-cols-4 gap-2">
              {importedImages.map((img) => (
                <div
                  key={img.publicId}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900"
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="100px" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImported(img.publicId)}
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
          {importedImages.length > 0 ? "Agregar más fotos" : "Fotos (hasta 12)"}
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
        </div>
      </form>
    </div>
  );
}
