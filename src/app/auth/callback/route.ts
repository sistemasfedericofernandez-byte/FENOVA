import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/safe-redirect";

/**
 * Destino del link de confirmación de email (signUp) y de cualquier otro
 * flujo de Supabase Auth basado en PKCE (p. ej. recuperar contraseña).
 * Supabase redirige acá con un `code` en la URL que hay que canjear por una
 * sesión real.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const errorMessage = encodeURIComponent(
    "El link venció o ya fue usado. Ingresá o pedí uno nuevo.",
  );
  return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
}
