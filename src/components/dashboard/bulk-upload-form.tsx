"use client";

import { useState, type ChangeEvent } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  bulkCreateProperties,
  type BulkRowInput,
  type BulkRowResult,
} from "@/server/actions/bulk-properties";

type RawRow = Record<string, string>;

const OPERATION_MAP: Record<string, BulkRowInput["operationType"]> = {
  venta: "venta",
  alquiler: "alquiler",
  alquiler_temporal: "alquiler_temporal",
  temporal: "alquiler_temporal",
};

const PROPERTY_TYPE_MAP: Record<string, BulkRowInput["propertyType"]> = {
  casa: "casa",
  departamento: "departamento",
  terreno: "terreno",
  local: "local",
  oficina: "oficina",
  galpon: "galpon",
  galpón: "galpon",
  quinta: "quinta",
  otro: "otro",
};

function toNumber(value: string | undefined) {
  if (!value) return undefined;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function parseRow(raw: RawRow): { data?: BulkRowInput; error?: string } {
  const title = raw["titulo"]?.trim();
  if (!title) return { error: "Falta 'titulo'" };

  const operationKey = raw["operacion"]?.trim().toLowerCase();
  const operationType = operationKey ? OPERATION_MAP[operationKey] : undefined;
  if (!operationType) return { error: `'operacion' inválida: ${raw["operacion"]}` };

  const typeKey = raw["tipo"]?.trim().toLowerCase();
  const propertyType = typeKey ? PROPERTY_TYPE_MAP[typeKey] : undefined;
  if (!propertyType) return { error: `'tipo' inválido: ${raw["tipo"]}` };

  const priceAmount = toNumber(raw["precio"]);
  if (!priceAmount) return { error: "Falta 'precio' o no es numérico" };

  const priceCurrency = raw["moneda"]?.trim().toUpperCase();
  if (priceCurrency !== "ARS" && priceCurrency !== "USD") {
    return { error: `'moneda' inválida: ${raw["moneda"]}` };
  }

  return {
    data: {
      title,
      description: raw["descripcion"]?.trim() || undefined,
      operationType,
      propertyType,
      neighborhoodName: raw["barrio"]?.trim() || undefined,
      priceAmount,
      priceCurrency,
      surfaceTotalM2: toNumber(raw["superficie_m2"]),
      bedrooms: toNumber(raw["dormitorios"]),
      bathrooms: toNumber(raw["banos"]),
      wantsPublished: raw["publicar"]?.trim().toLowerCase() === "si",
    },
  };
}

export function BulkUploadForm() {
  const [rows, setRows] = useState<
    { raw: RawRow; data?: BulkRowInput; error?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BulkRowResult[] | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResults(null);
    setSubmitError(null);

    let rawRows: RawRow[] = [];

    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      const parsed = Papa.parse<RawRow>(text, {
        header: true,
        skipEmptyLines: true,
      });
      rawRows = parsed.data;
    } else {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      rawRows = XLSX.utils.sheet_to_json<RawRow>(firstSheet, { defval: "" });
    }

    setRows(rawRows.map((raw) => ({ raw, ...parseRow(raw) })));
  }

  async function handleConfirm() {
    const validRows = rows.filter((r) => r.data).map((r) => r.data!);
    if (!validRows.length) return;

    setLoading(true);
    setSubmitError(null);

    const result = await bulkCreateProperties(validRows);

    setLoading(false);

    if (!result.ok) {
      setSubmitError(
        typeof result.error === "string" ? result.error : "No se pudo procesar el archivo",
      );
      return;
    }

    setResults(result.results);
  }

  const validCount = rows.filter((r) => r.data).length;
  const errorCount = rows.length - validCount;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        <p className="font-medium">Formato esperado (CSV o Excel)</p>
        <p className="text-zinc-600 dark:text-zinc-400">
          Columnas: <code>titulo, descripcion, operacion, tipo, barrio, precio,
          moneda, superficie_m2, dormitorios, banos, publicar</code>
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          operacion: venta / alquiler / alquiler_temporal · moneda: ARS / USD ·
          publicar: si / no
        </p>
        <a
          href="/templates/plantilla-carga-masiva.csv"
          download
          className="text-sm font-medium underline underline-offset-4"
        >
          Descargar plantilla de ejemplo
        </a>
      </div>

      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
        className="rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm dark:border-zinc-700"
      />

      {rows.length > 0 && !results ? (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {validCount} fila{validCount === 1 ? "" : "s"} válida
            {validCount === 1 ? "" : "s"}, {errorCount} con error
            {errorCount === 1 ? "" : "es"}.
          </p>

          <div className="max-h-80 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                  <th className="p-2">#</th>
                  <th className="p-2">Título</th>
                  <th className="p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="p-2">{i + 2}</td>
                    <td className="p-2">{r.raw["titulo"] || "(sin título)"}</td>
                    <td className="p-2">
                      {r.data ? (
                        <span className="text-emerald-600">OK</span>
                      ) : (
                        <span className="text-red-600">{r.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

          <Button disabled={!validCount || loading} onClick={handleConfirm}>
            {loading ? "Procesando..." : `Cargar ${validCount} propiedades`}
          </Button>
        </>
      ) : null}

      {results ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            {results.filter((r) => r.ok).length} cargadas, {" "}
            {results.filter((r) => !r.ok).length} con error.
          </p>
          <div className="max-h-80 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <tbody>
                {results.map((r) => (
                  <tr key={r.row} className="border-b border-zinc-100 dark:border-zinc-900">
                    <td className="p-2">{r.row}</td>
                    <td className="p-2">{r.title}</td>
                    <td className="p-2">
                      {r.ok ? (
                        <span className="text-emerald-600">{r.status}</span>
                      ) : (
                        <span className="text-red-600">{r.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
