/** Traduce los mensajes de error de Supabase Auth a algo claro para el usuario. */
export function translateAuthError(message: string | undefined | null) {
  const text = (message ?? "").toLowerCase();

  if (text.includes("invalid login credentials")) return "Email o contraseña incorrectos.";
  if (text.includes("email not confirmed"))
    return "Todavía no confirmaste tu email. Revisá tu casilla (y la carpeta de spam).";
  if (text.includes("already registered") || text.includes("already been registered"))
    return "Ya existe una cuenta con ese email. Probá ingresar.";
  if (text.includes("rate limit") || text.includes("too many") || text.includes("security purposes"))
    return "Demasiados intentos. Esperá unos minutos y volvé a probar.";
  if (text.includes("password") && (text.includes("at least") || text.includes("weak") || text.includes("short")))
    return "La contraseña es muy débil. Usá al menos 8 caracteres.";
  if (text.includes("same password"))
    return "La nueva contraseña tiene que ser distinta a la anterior.";
  if (text.includes("invalid email") || text.includes("unable to validate email"))
    return "El email no es válido.";
  if (text.includes("expired") || text.includes("invalid") && text.includes("token"))
    return "El link venció o ya fue usado. Pedí uno nuevo.";

  return "Ocurrió un error. Intentá de nuevo en unos minutos.";
}
