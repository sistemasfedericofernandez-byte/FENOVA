"use client";

import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateAgencyProfile } from "@/server/actions/agency";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import type { VerificationStatus } from "@/types/database.types";

const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  no_iniciado: "Todavía no solicitaste la verificación Propietario Seguro.",
  pendiente: "Tu solicitud de verificación está en revisión.",
  aprobado: "Estás verificado con el sello Propietario Seguro.",
  rechazado: "Tu solicitud de verificación fue rechazada.",
};

export function AgencyProfileForm({
  initial,
  verificationStatus,
}: {
  initial: {
    businessName: string;
    cuit: string;
    city: string;
    whatsappNumber: string;
    logoUrl: string;
  };
  verificationStatus: VerificationStatus;
}) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initial.businessName);
  const [cuit, setCuit] = useState(initial.cuit);
  const [city, setCity] = useState(initial.city);
  const [whatsappNumber, setWhatsappNumber] = useState(initial.whatsappNumber);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingLogo(true);
    setError(null);
    try {
      const { url } = await uploadImageToCloudinary(file, "agencies");
      setLogoUrl(url);
    } catch {
      setError("No se pudo subir el logo. Intentá de nuevo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    setSaving(true);

    const result = await updateAgencyProfile({
      businessName,
      cuit: cuit || undefined,
      city,
      whatsappNumber: whatsappNumber || undefined,
      logoUrl: logoUrl || undefined,
    });

    setSaving(false);

    if (!result.ok) {
      setError(
        typeof result.error === "string" ? result.error : "Revisá los datos del formulario",
      );
      return;
    }

    setStatusMessage("Cambios guardados.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
          {logoUrl ? (
            <Image src={logoUrl} alt="" fill className="object-cover" sizes="64px" />
          ) : null}
        </div>
        <label className="flex flex-col gap-1 text-sm">
          {logoUrl ? "Cambiar logo" : "Subir logo"}
          <input
            type="file"
            accept="image/*"
            disabled={uploadingLogo}
            onChange={handleLogoChange}
            className="rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
          />
        </label>
      </div>
      {uploadingLogo ? <p className="text-sm text-zinc-600">Subiendo logo...</p> : null}

      <input
        type="text"
        required
        placeholder="Nombre de la inmobiliaria"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="CUIT (opcional)"
          value={cuit}
          onChange={(e) => setCuit(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <input
          type="text"
          required
          placeholder="Ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
      </div>
      <input
        type="text"
        placeholder="WhatsApp de contacto (opcional)"
        value={whatsappNumber}
        onChange={(e) => setWhatsappNumber(e.target.value)}
        className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
      />

      <div className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
        <span>{VERIFICATION_LABEL[verificationStatus]}</span>
        {verificationStatus !== "aprobado" ? (
          <>
            {" "}
            <a href="/dashboard/verificacion" className="underline underline-offset-4">
              Solicitar Propietario Seguro
            </a>
          </>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {statusMessage ? <p className="text-sm text-emerald-600">{statusMessage}</p> : null}

      <Button type="submit" disabled={saving || uploadingLogo}>
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
