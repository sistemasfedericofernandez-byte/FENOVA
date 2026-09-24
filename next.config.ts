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
  async redirects() {
    return [
      // Un solo dominio canónico: www y la URL vieja de Vercel llevan a propimarket.com.ar
      // (así Google no ve el mismo sitio en tres direcciones).
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.propimarket.com.ar" }],
        destination: "https://propimarket.com.ar/:path*",
        permanent: true,
      },
      // /api queda afuera: el webhook de Mercado Pago puede seguir apuntando a la URL vieja.
      {
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "fenova-seven.vercel.app" }],
        destination: "https://propimarket.com.ar/:path",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<host>.*\\.vercel\\.app)" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
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
