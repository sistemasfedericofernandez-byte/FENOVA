"use client";

import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { StatusBadge } from "@/components/dashboard/page-header";
import { updateAgencyProfile } from "@/server/actions/agency";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import type { VerificationStatus } from "@/types/database.types";

const VERIFICATION: Record<
  VerificationStatus,
  { label: string; tone: "green" | "amber" | "gray" | "red"; text: string }
> = {
  no_iniciado: {
    label: "Sin verificar",
    tone: "gray",
    text: "El sello Propietario Seguro genera más confianza en tus avisos.",
  },
  pendiente: {
    label: "En revisión",
    tone: "amber",
    text: "Estamos revisando tu solicitud. Te avisamos por email.",
  },
  aprobado: {
    label: "Verificado",
    tone: "green",
    text: "Tus avisos muestran el sello Propietario Seguro.",
  },
  rechazado: {
    label: "Rechazado",
    tone: "red",
    text: "Podés volver a solicitarlo con otro comprobante.",
  },
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

  const verification = VERIFICATION[verificationStatus];

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <form onSubmit={handleSubmit} className="card flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-300 bg-zinc-100">
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo de tu inmobiliaria" fill className="object-cover" sizes="80px" />
            ) : (
              <span className="flex h-full items-center justify-center px-2 text-center text-xs font-medium text-zinc-600">
                Sin logo
              </span>
            )}
          </div>
          <Field
            label={logoUrl ? "Cambiar logo" : "Subir logo"}
            hint={uploadingLogo ? "Subiendo logo..." : "Una imagen cuadrada se ve mejor."}
            className="flex-1"
          >
            <input
              type="file"
              accept="image/*"
              disabled={uploadingLogo}
              onChange={handleLogoChange}
              className="field"
            />
          </Field>
        </div>

        <Field label="Nombre de la inmobiliaria">
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="field"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ciudad">
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="field"
            />
          </Field>
          <Field label="CUIT" hint="Opcional.">
            <input type="text" value={cuit} onChange={(e) => setCuit(e.target.value)} className="field" />
          </Field>
        </div>

        <Field label="WhatsApp de contacto" hint="Con código de país, sin espacios. Ej: 5493794000001">
          <input
            type="tel"
            inputMode="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="field"
          />
        </Field>

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        {statusMessage ? <p className="text-sm font-semibold text-emerald-700">{statusMessage}</p> : null}

        <Button type="submit" disabled={saving || uploadingLogo} className="w-full sm:w-auto sm:self-start">
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>

      <section className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#0d2740]">Propietario Seguro</h2>
            <StatusBadge tone={verification.tone}>{verification.label}</StatusBadge>
          </div>
          <p className="text-sm text-zinc-700">{verification.text}</p>
        </div>
        {verificationStatus !== "aprobado" && verificationStatus !== "pendiente" ? (
          <Link
            href="/dashboard/verificacion"
            className="text-sm font-semibold text-[#163a5c] underline underline-offset-4"
          >
            Solicitar verificación
          </Link>
        ) : null}
      </section>
    </div>
  );
}
