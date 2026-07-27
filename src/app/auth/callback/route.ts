import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino del link de confirmación de email (signUp) y de cualquier otro
 * flujo de Supabase Auth basado en PKCE. Supabase redirige acá con un
 * `code` en la URL que hay que canjear por una sesión real.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/propiedades";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=No pudimos confirmar tu email, intentá ingresar de nuevo`,
  );
}
