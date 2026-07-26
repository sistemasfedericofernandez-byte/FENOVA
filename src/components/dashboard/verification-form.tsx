"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import { submitVerificationRequest } from "@/server/actions/verification";
import type { VerificationStatus } from "@/types/database.types";

const STATUS_MESSAGE: Record<VerificationStatus, string> = {
  no_iniciado: "Todavía no solicitaste la verificación.",
  pendiente: "Tu solicitud está en revisión. Te avisamos por email.",
  aprobado: "¡Estás verificado! Tus propiedades muestran el sello Propietario Seguro.",
  rechazado: "Tu solicitud fue rechazada. Podés volver a intentarlo con otro comprobante.",
};

export function VerificationForm({
  initialStatus,
}: {
  initialStatus: VerificationStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  async function handleSubmit() {
    if (!file) return;
    setError(null);
    setLoading(true);

    try {
      const { url } = await uploadImageToCloudinary(file, "verifications");
      const result = await submitVerificationRequest(url);

      if (!result.ok) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "No se pudo enviar la solicitud",
        );
        setLoading(false);
        return;
      }

      setStatus("pendiente");
      setLoading(false);
      router.refresh();
    } catch {
      setError("No se pudo subir el archivo. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div
        className={`rounded-lg border p-4 text-sm ${
          status === "aprobado"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
            : status === "rechazado"
              ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
              : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        {STATUS_MESSAGE[status]}
      </div>

      {status !== "pendiente" && status !== "aprobado" ? (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Foto de tu DNI o comprobante de titularidad
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button disabled={!file || loading} onClick={handleSubmit}>
            {loading ? "Enviando..." : "Enviar para verificación"}
          </Button>
        </>
      ) : null}
    </div>
  );
}
