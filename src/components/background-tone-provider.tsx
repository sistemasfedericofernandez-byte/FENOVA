"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export type BackgroundTone =
  | "default"
  | "venta"
  | "alquiler"
  | "alquiler_temporal"
  | "hoteles";

/* Rota entre blanco, dorado y azul petróleo por sección, con un tinte
   moderado (ni imperceptible ni un golpe de color). */
const TONE_PRESETS: Record<BackgroundTone, [string, string, string]> = {
  default: ["#f8f6f1", "#faf8f3", "#f6f4ee"],
  venta: ["#f2ddab", "#eed6a2", "#f0e0b3"],
  alquiler: ["#b7cddc", "#aec6d8", "#bbd0dc"],
  alquiler_temporal: ["#f8f6f1", "#faf8f3", "#f6f4ee"],
  hoteles: ["#a1bcd0", "#98b4cb", "#a8c1d3"],
};

const BackgroundToneContext = createContext<((tone: BackgroundTone) => void) | null>(
  null,
);

// Máscara radial (en vez de filter: blur): desvanece el borde del foco de
// color de forma nativa, sin depender de blur — que en mobile Safari,
// combinado con position: fixed + overflow: hidden, terminaba recortando
// el desenfoque y dejando bordes duros tipo "mosaico".
const softMask: CSSProperties = {
  WebkitMaskImage: "radial-gradient(circle, black 0%, black 35%, transparent 72%)",
  maskImage: "radial-gradient(circle, black 0%, black 35%, transparent 72%)",
};

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
          style={{ backgroundColor: colors[0], ...softMask }}
          className="absolute -left-32 -top-32 h-[75vw] max-h-[680px] w-[75vw] max-w-[680px] opacity-60 transition-colors duration-[1400ms] ease-in-out"
        />
        <div
          style={{ backgroundColor: colors[1], ...softMask }}
          className="absolute -right-24 -top-16 h-[65vw] max-h-[600px] w-[65vw] max-w-[600px] opacity-60 transition-colors duration-[1400ms] ease-in-out"
        />
        <div
          style={{ backgroundColor: colors[2], ...softMask }}
          className="absolute -bottom-32 left-1/4 h-[70vw] max-h-[640px] w-[70vw] max-w-[640px] opacity-60 transition-colors duration-[1400ms] ease-in-out"
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
