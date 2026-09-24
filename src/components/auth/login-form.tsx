"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth-errors";
import { safeInternalPath } from "@/lib/safe-redirect";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get("error"));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (signInError || !data.user) {
      setLoading(false);
      setError(translateAuthError(signInError?.message));
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    const defaultDestination =
      profile?.role === "super_admin"
        ? "/admin/metricas"
        : profile?.role === "hotel"
          ? "/dashboard/hotel"
          : "/dashboard";

    router.push(safeInternalPath(searchParams.get("redirect"), defaultDestination));
    router.refresh();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
        />

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <Button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-center text-sm">
        <a href="/olvide-mi-contrasena" className="underline underline-offset-4">
          Olvidé mi contraseña
        </a>
        <a href="/registro" className="underline underline-offset-4">
          No tengo cuenta, crear una
        </a>
      </div>
    </>
  );
}
