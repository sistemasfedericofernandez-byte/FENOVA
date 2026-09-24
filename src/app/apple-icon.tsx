import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Ícono al agregar a la pantalla de inicio: las iniciales P y M sobre el azul de la marca. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d2740",
          color: "#ffffff",
          fontSize: 106,
          fontWeight: 800,
          letterSpacing: -5,
          borderRadius: 0,
          borderBottom: "8px solid #b6862f",
        }}
      >
        PM
      </div>
    ),
    size,
  );
}
