"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { lookupTenantByDni, rateTenant } from "@/server/actions/tenants";

type TenantRating = {
  tenant_id: string;
  full_name: string | null;
  score: number;
  comment: string | null;
  rated_by_agency_id: string;
  created_at: string;
};

export function TenantLookup() {
  const [dni, setDni] = useState("");
  const [searched, setSearched] = useState(false);
  const [ratings, setRatings] = useState<TenantRating[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [rateError, setRateError] = useState<string | null>(null);
  const [rateSuccess, setRateSuccess] = useState(false);
  const [rating, setRating] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setLookupError(null);
    setRateSuccess(false);
    const result = await lookupTenantByDni(dni);
    setLoading(false);
    setSearched(true);

    if (!result.ok) {
      setLookupError(result.error ?? "No se pudo consultar");
      setRatings([]);
      return;
    }

    setRatings((result.ratings as TenantRating[]) ?? []);
  }

  async function handleRate() {
    setRating(true);
    setRateError(null);
    setRateSuccess(false);

    const result = await rateTenant({
      dni,
      fullName: fullName || undefined,
      score,
      comment: comment || undefined,
    });

    setRating(false);

    if (!result.ok) {
      setRateError(
        typeof result.error === "string" ? result.error : "No se pudo guardar",
      );
      return;
    }

    setRateSuccess(true);
    setComment("");
    handleSearch();
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">DNI a consultar</label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ej: 30123456"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          />
          <Button disabled={!dni || loading} onClick={handleSearch}>
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </div>
      </div>

      {lookupError ? <p className="text-sm text-red-600">{lookupError}</p> : null}

      {searched && !lookupError ? (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">
            {ratings.length
              ? `${ratings.length} antecedente${ratings.length === 1 ? "" : "s"}`
              : "Sin antecedentes cargados"}
          </h3>
          {ratings.map((r, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {"★".repeat(r.score)}
                  {"☆".repeat(5 - r.score)}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(r.created_at).toLocaleDateString("es-AR")}
                </span>
              </div>
              {r.comment ? <p className="mt-1">{r.comment}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {searched && !lookupError ? (
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="font-medium">Dejar una calificación</h3>
          <input
            type="text"
            placeholder="Nombre del inquilino (opcional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          />
          <select
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          >
            {[5, 4, 3, 2, 1].map((s) => (
              <option key={s} value={s}>
                {"★".repeat(s)}
                {"☆".repeat(5 - s)}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Comentario (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          />
          {rateError ? <p className="text-sm text-red-600">{rateError}</p> : null}
          {rateSuccess ? (
            <p className="text-sm text-emerald-600">Calificación guardada.</p>
          ) : null}
          <Button disabled={rating} onClick={handleRate}>
            {rating ? "Guardando..." : "Guardar calificación"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
