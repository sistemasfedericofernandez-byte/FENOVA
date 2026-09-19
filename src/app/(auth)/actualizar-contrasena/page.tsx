"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";

export default function ActualizarContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("El link venció o ya fue usado. Pedí uno nuevo desde \"Olvidé mi contraseña\".");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(translateAuthError(updateError.message));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Elegí tu nueva contraseña</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Mínimo 8 caracteres.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Repetí la nueva contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2.5 text-base sm:text-sm dark:border-zinc-700"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar contraseña"}
        </Button>
      </form>
    </main>
  );
}
