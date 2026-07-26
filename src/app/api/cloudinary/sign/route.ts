import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signUploadParams } from "@/lib/cloudinary";

/**
 * Emite una firma de subida para que el cliente autenticado suba imágenes
 * directo a Cloudinary. Requiere sesión activa: solo agencias logueadas
 * pueden subir imágenes de propiedades o documentos de verificación.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const folder = typeof body.folder === "string" ? body.folder : "properties";

  const signed = signUploadParams({ folder });

  return NextResponse.json(signed);
}
