import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // Solo para las fotos placeholder (con etiqueta de texto) de las
        // propiedades demo — no son fotos reales, dicen qué representan.
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
