"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { TERMS_VERSION } from "@/lib/terms";
import type { UserRole } from "@/types/database.types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "inmobiliaria", label: "Inmobiliaria" },
  { value: "hotel", label: "Hotel" },
  { value: "dueno_directo", label: "Dueño directo" },
];

const INPUT_CLASS =
  "field";

export default function RegistroPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("inmobiliaria");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError("Tenés que aceptar los Términos y Condiciones para crear tu cuenta.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          role,
          full_name: fullName.trim(),
          business_name: businessName.trim(),
          whatsapp_number: whatsappNumber.trim(),
          terms_accepted_at: new Date().toISOString(),
          terms_version: TERMS_VERSION,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      return;
    }

    if (data.session) {
      router.push(role === "hotel" ? "/dashboard/hotel" : "/dashboard");
      router.refresh();
      return;
    }

    setConfirmationSent(true);
  }

  async function handleResend() {
    setResendMessage(null);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResendMessage(
      resendError ? translateAuthError(resendError.message) : "Listo, te lo mandamos de nuevo.",
    );
  }

  if (confirmationSent) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Revisá tu email</h1>
        <p className="text-zinc-700">
          Te enviamos un link de confirmación a <strong>{email}</strong>. Al
          tocarlo tu cuenta queda lista para usar. Si no lo ves, revisá la
          carpeta de spam.
        </p>
        <button
          type="button"
          onClick={handleResend}
          className="text-sm underline underline-offset-4"
        >
          Reenviar el email
        </button>
        {resendMessage ? <p className="text-sm text-zinc-600">{resendMessage}</p> : null}
        <a href="/login" className="text-sm underline underline-offset-4">
          Ya confirmé, ingresar
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Crear cuenta</h1>
        <p className="text-zinc-700">
          Registro para inmobiliarias, hoteles y dueños directos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={`flex-1 min-h-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                role === opt.value
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          required
          autoComplete="name"
          placeholder="Tu nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={INPUT_CLASS}
        />
        <input
          type="text"
          required={role !== "dueno_directo"}
          autoComplete="organization"
          placeholder={
            role === "dueno_directo"
              ? "Nombre (opcional si sos particular)"
              : "Nombre de tu inmobiliaria / hotel"
          }
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className={INPUT_CLASS}
        />
        <input
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="WhatsApp de contacto (ej: 5493794000001)"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          className={INPUT_CLASS}
        />
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={INPUT_CLASS}
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${INPUT_CLASS} w-full pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600 underline underline-offset-2"
          >
            {showPassword ? "Ocultar" : "Ver"}
          </button>
        </div>

        <label className="flex items-start gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0"
          />
          <span>
            Acepto los{" "}
            <a
              href="/terminos"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Términos y Condiciones
            </a>{" "}
            de PropiMarket.
          </span>
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <Button type="submit" disabled={loading || !termsAccepted}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <a href="/login" className="text-center text-sm underline underline-offset-4">
        Ya tengo cuenta, ingresar
      </a>
    </main>
  );
}
