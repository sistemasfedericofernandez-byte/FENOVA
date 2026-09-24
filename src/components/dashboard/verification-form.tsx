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
    <div className="card flex max-w-xl flex-col gap-4 p-5 sm:p-6">
      <div
        className={`rounded-xl border p-4 text-[15px] font-medium ${
          status === "aprobado"
            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
            : status === "rechazado"
              ? "border-red-300 bg-red-50 text-red-900"
              : "border-zinc-300 bg-zinc-50 text-zinc-800"
        }`}
      >
        {STATUS_MESSAGE[status]}
      </div>

      {status !== "pendiente" && status !== "aprobado" ? (
        <>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-zinc-800">
            Foto de tu DNI o comprobante de titularidad
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="field"
            />
          </label>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <Button disabled={!file || loading} onClick={handleSubmit}>
            {loading ? "Enviando..." : "Enviar para verificación"}
          </Button>
        </>
      ) : null}
    </div>
  );
}
