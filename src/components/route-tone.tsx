"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSetBackgroundTone } from "@/components/background-tone-provider";
import type { BackgroundTone } from "@/components/background-tone-provider";

/** Fija el tono del fondo según la sección actual — se re-evalúa en cada navegación. */
export function RouteTone() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setTone = useSetBackgroundTone();

  let tone: BackgroundTone = "default";
  if (pathname.startsWith("/hoteles")) {
    tone = "hoteles";
  } else if (pathname.startsWith("/propiedades")) {
    const operacion = searchParams.get("operacion");
    if (operacion === "venta" || operacion === "alquiler" || operacion === "alquiler_temporal") {
      tone = operacion;
    }
  }

  useEffect(() => {
    setTone(tone);
  }, [setTone, tone]);

  return null;
}
