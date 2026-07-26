"use client";

import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createProperty } from "@/server/actions/properties";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []).slice(0, 12));
  }

  async function handleSubmit(
    e: SyntheticEvent,
    status: "borrador" | "publicada",
  ) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const images = [];
      for (const file of files) {
        images.push(await uploadImageToCloudinary(file));
      }

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
    <form className="flex max-w-xl flex-col gap-3">
      <input
        type="text"
        required
        placeholder="Título (ej: Casa 3 dormitorios en Cambá Cué)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
      />
      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="resize-none rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={operationType}
          onChange={(e) => setOperationType(e.target.value as OperationType)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
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
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
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
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
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
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
        />
        <select
          value={priceCurrency}
          onChange={(e) => setPriceCurrency(e.target.value as PriceCurrency)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
        >
          <option value="USD">USD</option>
          <option value="ARS">ARS</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Superficie m²"
          value={surfaceTotalM2}
          onChange={(e) => setSurfaceTotalM2(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="Dormitorios"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="Baños"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-sm dark:border-zinc-700"
        />
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Fotos (hasta 12)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700"
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
  );
}
