import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // El HTML guardado de una publicación de Facebook Marketplace (para
      // importarla de forma confiable, ver src/server/actions/facebook-import.ts)
      // ronda 1MB, justo en el límite por defecto de Server Actions.
      bodySizeLimit: "8mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // Fotos reales de referencia (Unsplash) para las propiedades y
        // hoteles demo, mientras se suben fotos reales de cada agencia.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
