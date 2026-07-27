"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/database.types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "inmobiliaria", label: "Inmobiliaria" },
  { value: "hotel", label: "Hotel" },
  { value: "dueno_directo", label: "Dueño directo" },
];

export default function RegistroPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("inmobiliaria");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          role,
          full_name: fullName,
          business_name: businessName,
          whatsapp_number: whatsappNumber,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard/propiedades");
      router.refresh();
      return;
    }

    setConfirmationSent(true);
  }

  if (confirmationSent) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Revisá tu email</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Te enviamos un link de confirmación a {email}. Una vez confirmado ya
          podés ingresar.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Crear cuenta</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
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
          placeholder="Tu nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <input
          type="text"
          placeholder={
            role === "dueno_directo"
              ? "Nombre (opcional si sos particular)"
              : "Nombre de tu inmobiliaria / hotel"
          }
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <input
          type="tel"
          required
          placeholder="WhatsApp de contacto (ej: 5493794000001)"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <input
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button type="submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <a href="/login" className="text-center text-sm underline underline-offset-4">
        Ya tengo cuenta, ingresar
      </a>
    </main>
  );
}
