/**
 * Acepta solo rutas internas ("/dashboard/..."). Rechaza URLs absolutas,
 * "//host" y "/\host", que permitirían un open redirect.
 */
export function safeInternalPath(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
