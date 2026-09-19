"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";

export default function OlvideMiContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/actualizar-contrasena`,
    });

    setLoading(false);

    if (resetError) {
      setError(translateAuthError(resetError.message));
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Revisá tu email</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Si <strong>{email}</strong> tiene una cuenta, te mandamos un link para
          elegir una contraseña nueva. Si no lo ves, revisá la carpeta de spam.
        </p>
        <a href="/login" className="text-sm underline underline-offset-4">
          Volver a ingresar
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Recuperar contraseña</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Ingresá tu email y te mandamos un link para elegir una nueva.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar link"}
        </Button>
      </form>

      <a href="/login" className="text-center text-sm underline underline-offset-4">
        Volver a ingresar
      </a>
    </main>
  );
}
