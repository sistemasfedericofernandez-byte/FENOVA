import { ImageResponse } from "next/og";

export const alt = "PropiMarket — Propiedades y hoteles de Corrientes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen que se ve al compartir el sitio por WhatsApp, Facebook o en los resultados. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d2740",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -3, display: "flex" }}>PropiMarket</div>
        <div style={{ width: 180, height: 8, borderRadius: 8, background: "#b6862f", marginTop: 20, display: "flex" }} />
        <div style={{ fontSize: 40, color: "#c9d6e2", marginTop: 36, display: "flex" }}>
          Propiedades y hoteles de Corrientes
        </div>
        <div style={{ fontSize: 30, color: "#b6862f", marginTop: 18, display: "flex" }}>
          Alquiler · Venta · Alquiler temporal
        </div>
      </div>
    ),
    size,
  );
}
