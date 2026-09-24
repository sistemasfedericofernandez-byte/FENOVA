import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Ícono de la pestaña: las iniciales P y M sobre el azul de la marca. */
export default function Icon() {
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
          fontSize: 300,
          fontWeight: 800,
          letterSpacing: -14,
          borderRadius: 96,
          borderBottom: "22px solid #b6862f",
        }}
      >
        PM
      </div>
    ),
    size,
  );
}
