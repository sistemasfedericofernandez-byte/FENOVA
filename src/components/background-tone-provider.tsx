"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";

export type BackgroundTone =
  | "default"
  | "venta"
  | "alquiler"
  | "alquiler_temporal"
  | "hoteles";

const TONE_PRESETS: Record<BackgroundTone, [string, string, string]> = {
  default: ["#cfdbe6", "#f0e2bd", "#e7ddc8"],
  venta: ["#f0e2bd", "#e9c98a", "#ecdfc0"],
  alquiler: ["#b9cfe0", "#d7e3ec", "#cfd9df"],
  alquiler_temporal: ["#cfe0d6", "#e6ecd9", "#d8e6dc"],
  hoteles: ["#e9c98a", "#f0e2bd", "#e0c48f"],
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
          className="absolute -left-32 -top-32 h-[65vw] max-h-[620px] w-[65vw] max-w-[620px] rounded-full opacity-70 blur-3xl transition-colors duration-[900ms] ease-in-out"
        />
        <div
          style={{ backgroundColor: colors[1] }}
          className="absolute -right-24 -top-16 h-[55vw] max-h-[540px] w-[55vw] max-w-[540px] rounded-full opacity-70 blur-3xl transition-colors duration-[900ms] ease-in-out"
        />
        <div
          style={{ backgroundColor: colors[2] }}
          className="absolute -bottom-32 left-1/4 h-[60vw] max-h-[580px] w-[60vw] max-w-[580px] rounded-full opacity-70 blur-3xl transition-colors duration-[900ms] ease-in-out"
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
