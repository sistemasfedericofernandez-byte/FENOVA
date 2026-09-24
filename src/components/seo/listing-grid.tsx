"use client";

import type { ReactNode } from "react";

/**
 * Grilla de tarjetas de las páginas de búsqueda. Sin animación de entrada a
 * propósito: el contenido tiene que verse (y leerse) al instante.
 */
export function ListingGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
