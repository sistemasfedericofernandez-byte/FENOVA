"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

export type BackgroundTone =
  | "default"
  | "venta"
  | "alquiler"
  | "alquiler_temporal"
  | "hoteles";

/* Rota entre blanco, dorado y azul petróleo — un color bien marcado por
   sección en vez de un matiz apenas perceptible. */
const TONE_PRESETS: Record<BackgroundTone, [string, string, string]> = {
  default: ["#f8f6f1", "#faf8f3", "#f6f4ee"],
  venta: ["#f0d99b", "#ecd07f", "#eedcaa"],
  alquiler: ["#a7c2d6", "#9ab7cf", "#aec6d8"],
  alquiler_temporal: ["#f8f6f1", "#faf8f3", "#f6f4ee"],
  hoteles: ["#8fb0c9", "#83a6c2", "#96b7cc"],
};

const BackgroundToneContext = createContext<((tone: BackgroundTone) => void) | null>(
  null,
);

export function BackgroundToneProvider({ children }: { children: ReactNode }) {
  const [colors, setColors] = useState<[string, string, string]>(TONE_PRESETS.default);
  const current = useRef<BackgroundTone>("default");

  // Memoizado con deps vacías (current es un ref y setColors es estable):
  // si esta función cambiara de identidad en cada render, el useEffect de
  // RouteTone (que la usa como dependencia) se re-dispararía cada vez que
  // el tono cambia y lo pisaría de nuevo con el tono de la ruta actual.
  const setTone = useCallback((tone: BackgroundTone) => {
    if (current.current === tone) return;
    current.current = tone;
    setColors(TONE_PRESETS[tone]);
  }, []);

  return (
    <BackgroundToneContext.Provider value={setTone}>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          style={{ backgroundColor: colors[0] }}
          className="absolute -left-32 -top-32 h-[65vw] max-h-[620px] w-[65vw] max-w-[620px] rounded-full opacity-75 blur-3xl transition-colors duration-[1100ms] ease-in-out"
        />
        <div
          style={{ backgroundColor: colors[1] }}
          className="absolute -right-24 -top-16 h-[55vw] max-h-[540px] w-[55vw] max-w-[540px] rounded-full opacity-75 blur-3xl transition-colors duration-[1100ms] ease-in-out"
        />
        <div
          style={{ backgroundColor: colors[2] }}
          className="absolute -bottom-32 left-1/4 h-[60vw] max-h-[580px] w-[60vw] max-w-[580px] rounded-full opacity-75 blur-3xl transition-colors duration-[1100ms] ease-in-out"
        />
      </div>
      {children}
    </BackgroundToneContext.Provider>
  );
}

/** Cambia el tono del fondo (los tres focos de color detrás del contenido). No-op fuera del provider. */
export function useSetBackgroundTone() {
  const setTone = useContext(BackgroundToneContext);
  return setTone ?? (() => {});
}
