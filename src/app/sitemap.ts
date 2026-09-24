import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getActiveNeighborhoodNames, getPublishedProperties } from "@/server/services/public-properties";
import { neighborhoodSlug } from "@/lib/corrientes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [{ data: properties }, { data: hotels }] = await Promise.all([
    supabase.from("properties").select("slug, updated_at").eq("status", "publicada"),
    supabase.from("hotels").select("slug, updated_at").eq("status", "publicada"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/propiedades`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/hoteles`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/alquiler-en-corrientes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/venta-en-corrientes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/alquiler-temporal-en-corrientes`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/mapa`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/alertas`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/terminos`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Solo barrios que tienen avisos: una página vacía no aporta nada en Google.
  const [allProperties, allNeighborhoods] = await Promise.all([
    getPublishedProperties(),
    getActiveNeighborhoodNames(),
  ]);
  const neighborhoodsWithListings = new Set(allProperties.map((p) => p.neighborhoodName).filter(Boolean));
  const neighborhoodRoutes: MetadataRoute.Sitemap = allNeighborhoods
    .filter((name) => neighborhoodsWithListings.has(name))
    .map((name) => ({
      url: `${siteUrl}/barrios/${neighborhoodSlug(name)}`,
      changeFrequency: "daily",
      priority: 0.7,
    }));

  const propertyRoutes: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${siteUrl}/propiedades/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const hotelRoutes: MetadataRoute.Sitemap = (hotels ?? []).map((h) => ({
    url: `${siteUrl}/hoteles/${h.slug}`,
    lastModified: h.updated_at,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...neighborhoodRoutes, ...propertyRoutes, ...hotelRoutes];
}
