import type { MetadataRoute } from "next";
import {
  getIndustries,
  getPosts,
  getSeoSettings,
  getServices,
  getSolutions,
} from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, industries, posts, solutions, seo] = await Promise.all([
    getServices(),
    getIndustries(),
    getPosts(),
    getSolutions(),
    getSeoSettings(),
  ]);
  const hidden = new Set(seo.filter((s) => s.noindex).map((s) => (s.path === "/" ? "" : s.path)));

  const staticPages = [
    "",
    "/services",
    "/solutions",
    "/industries",
    "/blog",
    "/about",
    "/faqs",
    "/contact",
    "/quote",
    "/book-consultation",
    "/privacy",
    "/terms",
  ]
    .filter((path) => !hidden.has(path))
    .map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : path === "/services" || path === "/quote" ? 0.9 : 0.6,
    }));

  const entries = (prefix: string, rows: { slug: string; updated_at: string }[], priority: number) =>
    rows.map((row) => ({
      url: `${siteUrl}${prefix}/${row.slug}`,
      lastModified: row.updated_at,
      changeFrequency: "monthly" as const,
      priority,
    }));

  return [
    ...staticPages,
    ...entries("/services", services, 0.8),
    ...entries("/solutions", solutions, 0.7),
    ...entries("/industries", industries, 0.7),
    ...entries("/blog", posts, 0.6),
  ];
}
