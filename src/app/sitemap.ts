import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

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
    { url: `${siteUrl}/alertas`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/login`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/registro`, changeFrequency: "yearly", priority: 0.3 },
  ];

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

  return [...staticRoutes, ...propertyRoutes, ...hotelRoutes];
}
